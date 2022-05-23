/* eslint-disable import/prefer-default-export */
import { ApiPromise } from '@polkadot/api';
import { U8aFixed } from '@polkadot/types';
import { PalletMultisigMultisig } from '@polkadot/types/lookup';
// import { H256 } from '@polkadot/types/interfaces';
// import { Option, StorageKey, U8aFixed } from '@polkadot/types';
// import { AccountId32 } from '@polkadot/types/interfaces';
// import { PalletMultisigMultisig } from '@polkadot/types/lookup';
// import { Option } from '@polkadot/types';
// import { PalletMultisigMultisig } from '@polkadot/types/lookup';
import {
  Chain,
  Transaction,
  TransactionStatus,
  TransactionType,
  Wallet,
} from '../db/db';

type MultisigTransaction = {
  callHash: U8aFixed;
  opt: PalletMultisigMultisig;
};

export const getPendingMultisigTransacions = async (
  api: ApiPromise,
  address: string,
): Promise<(MultisigTransaction | undefined)[]> => {
  const multisigs = await api.query.multisig.multisigs.entries(address);
  const transactions = multisigs
    .filter(([, opt]) => opt.isSome)
    .map(([storage, opt]) => {
      const optValue = opt.unwrap();
      if (!optValue) return;

      const [, callHash] = storage.args;
      // eslint-disable-next-line consistent-return
      return {
        callHash,
        opt: optValue,
      };
    });

  return transactions;
};

export const compareTransactions = (
  transaction: Transaction,
  multisigTransaction: MultisigTransaction,
) => {
  if (transaction.type !== TransactionType.MULTISIG_TRANSFER) return false;
  if (multisigTransaction.opt.depositor.toString() !== transaction.address) {
    return false;
  }
  if (
    multisigTransaction.opt.when.height.toString() !==
    transaction.blockHeight?.toString()
  ) {
    return false;
  }
  if (
    multisigTransaction.opt.deposit.toString() !==
    transaction.data.deposit?.toString()
  ) {
    return false;
  }

  return true;
};

export const updateTransaction = (
  transaction: Transaction,
  pendingTransaction: MultisigTransaction,
) => {
  return {
    ...transaction,
    blockHeight: pendingTransaction.opt.when.height.toNumber(),
    blockHash: pendingTransaction.opt.when.hash.toHex(),
    data: {
      ...transaction.data,
      deposit: pendingTransaction.opt.deposit.toString(),
      approvals: pendingTransaction.opt.approvals.map((a) => a.toString()),
    },
  };
};

export const createTransactionFromPending = (
  pendingTransaction: MultisigTransaction,
  network: Chain,
  wallet: Wallet,
): Transaction => {
  const {
    callHash,
    opt: { depositor, when, approvals, deposit },
  } = pendingTransaction;

  return {
    address: depositor.toString(),
    createdAt: new Date(),
    type: TransactionType.MULTISIG_TRANSFER,
    blockHeight: when.height.toNumber(),
    blockHash: when.hash.toHex(),
    wallet,
    chainId: network.chainId,
    status: TransactionStatus.PENDING,
    data: {
      callHash: callHash.toHex(),
      amount: '',
      deposit: deposit.toString(),
      approvals: approvals.map((a) => a.toString()),
    },
  };
};

export const mapTransactionsWithBlockchain = (
  savedTransactions: Transaction[] = [],
  pendingTransactions: (MultisigTransaction | undefined)[] = [],
  wallet: Wallet,
  network: Chain,
) =>
  pendingTransactions.map((p) => {
    if (!p) return;
    const isSaved = savedTransactions.some((s) => compareTransactions(s, p));
    if (isSaved) return;
    // eslint-disable-next-line consistent-return
    return createTransactionFromPending(p, network, wallet);
  });
