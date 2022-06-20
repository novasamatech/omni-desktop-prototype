/* eslint-disable consistent-return */
/* eslint-disable import/prefer-default-export */
import { ApiPromise } from '@polkadot/api';
import { U8aFixed } from '@polkadot/types';
import { PalletMultisigMultisig } from '@polkadot/types/lookup';
import { Call } from '@polkadot/types/interfaces';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { Connection } from '../store/connections';
import {
  Asset,
  AssetType,
  Chain,
  MultisigWallet,
  OrmlExtras,
  StatemineExtras,
  Transaction,
  TransactionStatus,
  TransactionType,
  Wallet,
} from '../db/types';
import {
  createApprovals,
  formatAddress,
  getAddressFromWallet,
  toPublicKey,
} from './account';
import { db } from '../db/db';
import { formatAmount, formatBalance, getAssetById } from './assets';
import { Approvals, HexString } from '../../common/types';

type MultisigTransaction = {
  callHash: U8aFixed;
  opt: PalletMultisigMultisig;
};

export const getPendingTransactionsFromChain = async (
  api: ApiPromise,
  address: string,
): Promise<MultisigTransaction[]> => {
  const multisigs = await api.query.multisig.multisigs.entries(address);
  return multisigs
    .filter(([, opt]) => opt.isSome)
    .reduce((result, [storage, opt]) => {
      if (opt.isNone) return result;

      const optValue = opt.unwrap();
      const [, callHash] = storage.args;

      return [
        ...result,
        {
          callHash,
          opt: optValue,
        },
      ];
    }, [] as MultisigTransaction[]);
};

export const isSameTransaction = (
  transaction: Transaction,
  multisigTransaction: MultisigTransaction,
) => {
  return (
    multisigTransaction.callHash.toString() ===
    transaction.data.callHash?.toString()
  );
};

export const updateTransactionPayload = (
  transaction: Transaction,
  pendingTransaction: MultisigTransaction,
): Transaction => {
  const { approvals } = transaction.data;
  pendingTransaction.opt.approvals.forEach((approval) => {
    approvals[toPublicKey(approval.toString())].fromBlockChain = true;
  });

  return {
    ...transaction,
    blockHeight: pendingTransaction.opt.when.height.toNumber(),
    blockHash: pendingTransaction.opt.when.hash.toHex(),
    extrinsicIndex: pendingTransaction.opt.when.index.toNumber(),
    status: TransactionStatus.PENDING,
    data: {
      ...transaction.data,
      deposit: pendingTransaction.opt.deposit.toString(),
      depositor: pendingTransaction.opt.depositor.toHex(),
      approvals,
    },
  };
};

export const createTransactionPayload = (
  pendingTransaction: MultisigTransaction,
  network: Chain,
  wallet: Wallet,
): Transaction => {
  const {
    callHash,
    opt: { when, approvals, deposit },
  } = pendingTransaction;

  const approvalsPayload = createApprovals(wallet as MultisigWallet, network);

  approvals.forEach((approval) => {
    approvalsPayload[toPublicKey(approval.toString())].fromBlockChain = true;
  });

  return {
    address: wallet.mainAccounts[0].accountId.toString(),
    createdAt: new Date(),
    type: TransactionType.MULTISIG_TRANSFER,
    blockHeight: when.height.toNumber(),
    blockHash: when.hash.toHex(),
    wallet,
    chainId: network.chainId,
    status: TransactionStatus.PENDING,
    data: {
      callHash: callHash.toHex(),
      deposit: deposit.toString(),
      approvals: approvalsPayload,
    },
  };
};

export const updateTimepointFromBlockchain = async (
  transaction: Transaction,
  connection: Connection,
) => {
  if (!transaction || !connection) return;

  const multisigTransaction = await connection.api.query.multisig.multisigs(
    getAddressFromWallet(transaction.wallet, connection.network),
    transaction.data.callHash as string,
  );
  if (multisigTransaction.isNone) return;

  const pendingTransaction = multisigTransaction.unwrap();

  if (!pendingTransaction) return;

  db.transactions.put({
    ...transaction,
    blockHeight: pendingTransaction.when.height.toNumber(),
    blockHash: pendingTransaction.when.hash.toHex(),
    extrinsicIndex: pendingTransaction.when.index.toNumber(),
  });
};

export const updateTransactions = async (
  transactions: Transaction[] = [],
  wallet: Wallet,
  connection: Connection,
) => {
  const pendingTransactions = await getPendingTransactionsFromChain(
    connection.api,
    getAddressFromWallet(wallet, connection.network),
  );
  const activeTxs = transactions.filter((tx) =>
    [TransactionStatus.PENDING, TransactionStatus.CREATED].includes(tx.status),
  );
  pendingTransactions.forEach((p) => {
    const activeTransaction = activeTxs.find((s) => isSameTransaction(s, p));

    if (activeTransaction) {
      db.transactions.put(updateTransactionPayload(activeTransaction, p));
    } else {
      db.transactions.add(
        createTransactionPayload(p, connection.network, wallet),
      );
    }
  });
};

export const updateTransaction = async (
  transaction: Transaction,
  connection: Connection,
) => {
  const pendingTransactions = await getPendingTransactionsFromChain(
    connection.api,
    formatAddress(transaction.address),
  );
  const pendingTransaction = pendingTransactions.find((p) =>
    isSameTransaction(transaction, p),
  );

  if (!pendingTransaction) return;

  db.transactions.put(
    updateTransactionPayload(transaction, pendingTransaction),
  );
};

export const isApproved = (
  publicKey: string,
  approvals: Approvals,
): boolean => {
  const approval = approvals[publicKey];
  return approval?.fromBlockChain || approval?.fromMatrix;
};

export const getApprovals = (transaction: Transaction): string[] =>
  Object.keys(transaction.data.approvals || []).filter((a) =>
    isApproved(a, transaction.data.approvals),
  );

export const checkFinalApprove = (transaction: Transaction) =>
  Number((transaction.wallet as MultisigWallet).threshold) -
    getApprovals(transaction).length ===
  1;

export const decodeCallData = (
  api: ApiPromise,
  network: Chain,
  callData: string,
) => {
  const data: Record<string, any> = {};
  let extrinsicCall: Call;
  let decoded: SubmittableExtrinsic<'promise'> | null = null;

  try {
    // cater for an extrinsic input...
    decoded = api.tx(callData);
    extrinsicCall = api.createType('Call', decoded.method);
  } catch (e) {
    extrinsicCall = api.createType('Call', callData);
  }

  const { method, section } = api.registry.findMetaCall(
    extrinsicCall.callIndex,
  );
  const extrinsicFn = api.tx[section][method];
  const extrinsic = extrinsicFn(...extrinsicCall.args);

  if (!decoded) {
    decoded = extrinsic;
  }
  if (method === 'transfer' && section === 'balances') {
    data.address = decoded.args[0].toString();
    data.amount = formatBalance(
      decoded.args[1].toString(),
      network?.assets[0].precision || 0,
    );
  }
  if (method === 'transfer' && section === 'assets') {
    data.assetId = decoded.args[0].toString();
    data.address = decoded.args[1].toString();
    const asset = getAssetById(network?.assets || [], data.assetId);
    data.amount = formatBalance(
      decoded.args[2].toString(),
      asset?.precision || 0,
    );
  }
  if (method === 'transfer' && section === 'currencies') {
    data.address = decoded.args[0].toString();
    data.assetId = decoded.args[1].toString();
    const asset = getAssetById(network?.assets || [], data.assetId);
    data.amount = formatBalance(
      decoded.args[2].toString(),
      asset?.precision || 0,
    );
  }

  return data;
};

export const getTransferExtrinsic = (
  connection: Connection,
  asset: Asset,
  address: string,
  amount: string,
) => {
  if (asset.type === AssetType.STATEMINE) {
    return connection.api.tx.assets.transfer(
      (asset.typeExtras as StatemineExtras).assetId,
      address,
      formatAmount(amount, asset.precision),
    );
  }
  if (asset.type === AssetType.ORML) {
    return connection.api.tx.currencies.transfer(
      address,
      (asset.typeExtras as OrmlExtras).currencyIdScale,
      formatAmount(amount, asset.precision),
    );
  }

  return connection.api.tx.balances.transfer(
    address,
    formatAmount(amount, asset.precision),
  );
};

export const createApproveData = (
  connection: Connection,
  transaction: Transaction,
) => {
  const address = getAddressFromWallet(transaction.wallet, connection.network);
  const MAX_WEIGHT = 640000000;
  const when =
    transaction.blockHeight && transaction.extrinsicIndex
      ? {
          height: transaction.blockHeight,
          index: transaction.extrinsicIndex,
        }
      : null;
  const otherSignatories = transaction.wallet.isMultisig
    ? (transaction.wallet as MultisigWallet).originContacts
        .map((c) => getAddressFromWallet(c, connection.network))
        .filter((c) => c !== address)
        .sort()
    : [];
  const { threshold } = transaction.wallet as MultisigWallet;

  return {
    threshold,
    otherSignatories,
    maybeTimepoint: when,
    callHash: transaction.data.callHash,
    maxWeight: MAX_WEIGHT,
    call: transaction.data.callData,
    storeCall: false,
  };
};

export const getMultisigTransferExtrinsic = (
  connection: Connection,
  transaction: Transaction,
) => {
  const approveData = createApproveData(connection, transaction);

  return connection.api.tx.multisig.asMulti(
    approveData.threshold,
    approveData.otherSignatories,
    approveData.maybeTimepoint,
    approveData.call,
    approveData.storeCall,
    approveData.maxWeight,
  );
};

export const getExistingMstTransactions = (
  transactions: Transaction[] = [],
  chainId: HexString,
  callHash?: HexString,
): Transaction[] => {
  if (!callHash) return [];

  return transactions.filter(
    (tx) =>
      tx.type === TransactionType.MULTISIG_TRANSFER &&
      [TransactionStatus.CREATED, TransactionStatus.PENDING].includes(
        tx.status,
      ) &&
      tx.chainId === chainId &&
      tx.data.callHash === callHash,
  );
};
