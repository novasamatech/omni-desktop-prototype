import React, { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { useHistory } from 'react-router-dom';
import { QrScanSignature } from '@polkadot/react-qr';
import {
  getRegistry,
  GetRegistryOpts,
  UnsignedTransaction,
} from '@substrate/txwrapper-polkadot';
import { Dialog } from '@headlessui/react';
import { capitalize } from 'lodash';

import { GenericExtrinsic } from '@polkadot/types';
import { Connection, connectionState } from '../store/connections';
import {
  currentTransactionState,
  currentUnsignedState,
  signWithState,
} from '../store/currentTransaction';
import { HexString } from '../../common/types';
import LinkButton from '../ui/LinkButton';
import { Routes, withId } from '../../common/constants';
import { db } from '../db/db';
import {
  MultisigWallet,
  Transaction,
  TransactionStatus,
  TransactionType,
} from '../db/types';
import { getSignedExtrinsic } from '../utils/transactions';
import { getAddressFromWallet, toPublicKey } from '../utils/account';
import { useMatrix } from './Providers/MatrixProvider';
import Shimmer from '../ui/Shimmer';
import DialogContent from '../ui/DialogContent';
import Button from '../ui/Button';

type ExtrinsicSubmit = {
  extrinsicHash: HexString;
  isFinalApprove: boolean;
  isSuccessExtrinsic: boolean;
};

const ScanCode: React.FC = () => {
  const history = useHistory();
  const { matrix } = useMatrix();

  const [isTxSent, setIsTxSent] = useState(false);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState('');

  const networks = useRecoilValue(connectionState);
  const transaction = useRecoilValue(currentTransactionState);
  const signWith = useRecoilValue(signWithState);
  const unsigned = useRecoilValue(currentUnsignedState);

  const createSignedTx = async (
    network: Connection,
    signature: HexString,
    unsignedTx: UnsignedTransaction,
  ): Promise<GenericExtrinsic> => {
    const metadataRpc = await network.api.rpc.state.getMetadata();
    const { specVersion, specName } =
      await network.api.rpc.state.getRuntimeVersion();

    const registry = getRegistry({
      chainName: network?.network.name || '',
      specName: specName.toString() as GetRegistryOpts['specName'],
      specVersion: specVersion.toNumber(),
      metadataRpc: metadataRpc.toHex(),
    });

    return getSignedExtrinsic(unsignedTx, signature, {
      metadataRpc: metadataRpc.toHex(),
      registry,
    });
  };

  const submitAndWatchExtrinsic = (
    tx: GenericExtrinsic,
    network: Connection,
    callback: (result: ExtrinsicSubmit) => void,
  ): ExtrinsicSubmit | void => {
    let extrinsicCalls = 0;

    network.api.rpc.author.submitAndWatchExtrinsic(tx, async (result) => {
      if (!result.isInBlock || extrinsicCalls > 1) return;

      const signedBlock = await network.api.rpc.chain.getBlock();
      const apiAt = await network.api.at(signedBlock.block.header.hash);
      const allRecords = await apiAt.query.system.events();

      let actualTxHash = result.inner;
      let isFinalApprove = false;
      let isSuccessExtrinsic = false;

      // information for each contained extrinsic
      signedBlock.block.extrinsics.forEach(
        ({ method: { method, section }, signer, args, hash }, index) => {
          if (
            method !== tx.method.method ||
            section !== tx.method.section ||
            signer.toHex() !== tx.signer.toHex() ||
            args[0]?.toString() !== tx.args[0]?.toString() ||
            args[1]?.toString() !== tx.args[1]?.toString() ||
            args[2]?.toString() !== tx.args[2]?.toString()
          ) {
            return;
          }

          allRecords.forEach(({ phase, event }) => {
            if (!phase.isApplyExtrinsic || !phase.asApplyExtrinsic.eq(index))
              return;

            if (network.api.events.multisig.MultisigExecuted.is(event)) {
              isFinalApprove = true;
            }

            if (network.api.events.system.ExtrinsicSuccess.is(event)) {
              actualTxHash = hash;
              isSuccessExtrinsic = true;
              extrinsicCalls += 1;
            }

            if (network.api.events.system.ExtrinsicFailed.is(event)) {
              const [dispatchError] = event.data;
              let errorInfo = dispatchError.toString();

              if (dispatchError.isModule) {
                const decoded = network.api.registry.findMetaError(
                  dispatchError.asModule,
                );

                errorInfo = decoded.name
                  .split(/(?=[A-Z])/)
                  .map((w) => w.toLowerCase())
                  .join(' ');
              }
              setError(capitalize(errorInfo));
              setDialogOpen(true);
            }
          });
        },
      );

      if (extrinsicCalls === 1) {
        callback({
          extrinsicHash: actualTxHash.toHex(),
          isFinalApprove,
          isSuccessExtrinsic,
        });
      }
    });
  };

  const updateTransactionDb = (
    tx: Transaction,
    extrinsicHash: HexString,
    txStatus: TransactionStatus,
  ) => {
    if (!tx.id) return;

    if (tx.type === TransactionType.TRANSFER) {
      db.transactions.update(tx.id, {
        ...tx,
        transactionHash: extrinsicHash,
        status: TransactionStatus.CONFIRMED,
      });
    }

    if (tx.type === TransactionType.MULTISIG_TRANSFER) {
      const { approvals } = tx.data;
      const publicKey = toPublicKey(signWith?.mainAccounts[0].accountId || '');

      const approvalsPayload = {
        ...approvals,
        [publicKey]: {
          ...approvals[publicKey],
          fromMatrix: true,
          fromBlockChain: true,
          extrinsicHash,
        },
      };

      db.transactions.update(tx.id, {
        status: txStatus,
        data: { ...tx.data, approvals: approvalsPayload },
      });
    }
  };

  const sendMatrixEvent = async (
    tx: Transaction,
    network: Connection,
    txStatus: TransactionStatus,
    extrinsicHash: HexString,
  ) => {
    const multisigWallet = tx.wallet as MultisigWallet;
    if (!signWith || !multisigWallet.matrixRoomId) return;

    const matrixEventData = {
      senderAddress: getAddressFromWallet(signWith, network.network),
      salt: tx.data.salt,
      extrinsicHash,
      chainId: network.network.chainId,
      callHash: tx.data.callHash,
    };

    matrix.setRoom(multisigWallet.matrixRoomId);
    if (txStatus === TransactionStatus.CONFIRMED) {
      matrix.mstFinalApprove(matrixEventData);
    }
    if (txStatus === TransactionStatus.PENDING) {
      matrix.mstApprove(matrixEventData);
    }
  };

  const onGetSignature = async ({ signature }: { signature: HexString }) => {
    if (isTxSent || !unsigned || !signature) return;
    setIsTxSent(true);

    if (!transaction || !transaction.id || !Object.values(networks).length)
      return;

    const network = Object.values(networks).find(
      (n) => n.network.chainId === transaction.chainId,
    );
    if (!network?.api) return;

    try {
      const tx = await createSignedTx(network, signature, unsigned);
      submitAndWatchExtrinsic(tx, network, async (txResult) => {
        if (
          !transaction.id ||
          !txResult ||
          !txResult.isSuccessExtrinsic ||
          !txResult.extrinsicHash
        )
          return;

        const transactionStatus = txResult.isFinalApprove
          ? TransactionStatus.CONFIRMED
          : TransactionStatus.PENDING;

        await updateTransactionDb(
          transaction,
          txResult.extrinsicHash,
          transactionStatus,
        );
        if (transaction.type === TransactionType.MULTISIG_TRANSFER) {
          await sendMatrixEvent(
            transaction,
            network,
            transactionStatus,
            txResult.extrinsicHash,
          );
        }
        history.push(withId(Routes.TRANSFER_DETAILS, transaction.id));
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      setError(capitalize(message));
      setDialogOpen(true);
    }
  };

  return (
    <>
      <div className="h-ribbon flex flex-col">
        <div className="flex justify-center items-center">
          <LinkButton className="ml-2 absolute left-0" to={Routes.SHOW_CODE}>
            Back
          </LinkButton>
          <h2 className="h-16 p-4 font-light text-lg">
            Upload signed operations via Parity Signer
          </h2>
        </div>

        <div className="flex flex-1 flex-col justify-center items-center">
          <div className="font-normal text-base">
            Scan QR code from Parity Signer with Omni
          </div>
          <div className="w-80 h-80 m-4">
            {transaction && !isTxSent ? (
              <QrScanSignature onScan={onGetSignature} />
            ) : (
              <Shimmer width="100%" height="100%" />
            )}
          </div>
        </div>
      </div>

      <Dialog
        as="div"
        className="relative z-10"
        open={isDialogOpen}
        onClose={() => setDialogOpen(false)}
      >
        <DialogContent>
          <Dialog.Title as="h3" className="font-light text-xl">
            Error
          </Dialog.Title>
          <div className="mt-2">{error || 'Something went wrong'}</div>

          <div className=" mt-2 flex justify-between">
            <Button
              className="min-w-min"
              onClick={() => history.push(Routes.SHOW_CODE)}
            >
              Try again
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ScanCode;
