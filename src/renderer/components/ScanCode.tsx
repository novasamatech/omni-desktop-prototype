import React, { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { useHistory } from 'react-router-dom';
import { QrScanSignature } from '@polkadot/react-qr';
import { GenericExtrinsic } from '@polkadot/types';
import {
  getRegistry,
  GetRegistryOpts,
  createMetadata,
  OptionsWithMeta,
  UnsignedTransaction,
} from '@substrate/txwrapper-polkadot';
import { Dialog } from '@headlessui/react';

import { connectionState } from '../store/connections';
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
  TransactionStatus,
  TransactionType,
  MultisigWallet,
} from '../db/types';
import { isFinalApprove } from '../utils/transactions';
import { getAddressFromWallet, toPublicKey } from '../utils/account';
import { useMatrix } from './Providers/MatrixProvider';
import Shimmer from '../ui/Shimmer';
import DialogContent from '../ui/DialogContent';
import Button from '../ui/Button';

// TODO: Move this function to utils
function createSignedTx(
  unsigned: UnsignedTransaction,
  signature: HexString,
  options: OptionsWithMeta,
): GenericExtrinsic {
  const {
    metadataRpc,
    registry,
    asCallsOnlyArg,
    signedExtensions,
    userExtensions,
  } = options;
  const metadata = createMetadata(registry, metadataRpc, asCallsOnlyArg);

  registry.setMetadata(metadata, signedExtensions, userExtensions);

  const extrinsic = registry.createType(
    'Extrinsic',
    { method: unsigned.method },
    { version: unsigned.version },
  );

  extrinsic.addSignature(unsigned.address, signature, unsigned);

  return extrinsic;
}

const ScanCode: React.FC = () => {
  const networks = useRecoilValue(connectionState);
  const history = useHistory();
  const { matrix } = useMatrix();

  const [isTxSent, setIsTxSent] = useState(false);
  const [isDialogOpen, setDialogOpen] = useState(false);

  const transaction = useRecoilValue(currentTransactionState);
  const signWith = useRecoilValue(signWithState);
  const unsigned = useRecoilValue(currentUnsignedState);

  // TODO: Refactor sign and send transaction flow
  const onGetSignature = async (payload: any) => {
    if (isTxSent || !unsigned) return;

    setIsTxSent(true);

    if (!transaction || !Object.values(networks).length) return;

    const network = Object.values(networks).find(
      (n) => n.network.chainId === transaction.chainId,
    );

    if (!network?.api) return;

    const metadataRpc = await network.api.rpc.state.getMetadata();
    const { specVersion, specName } =
      await network.api.rpc.state.getRuntimeVersion();

    const registry = getRegistry({
      chainName: network?.network.name || '',
      specName: specName.toString() as GetRegistryOpts['specName'],
      specVersion: specVersion.toNumber(),
      metadataRpc: metadataRpc.toHex(),
    });
    const signature = payload.signature || '';
    const tx = createSignedTx(unsigned, signature, {
      metadataRpc: metadataRpc.toHex(),
      registry,
    });

    network.api.rpc.author.submitAndWatchExtrinsic(tx, async (result) => {
      if (!result.isInBlock) return;

      let actualTxHash = result.inner;

      const signedBlock = await network.api.rpc.chain.getBlock();
      const apiAt = await network.api.at(signedBlock.block.header.hash);
      const allRecords = await apiAt.query.system.events();

      // the information for each of the contained extrinsics
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

          allRecords
            .filter(
              ({ phase }) =>
                phase.isApplyExtrinsic && phase.asApplyExtrinsic.eq(index),
            )
            .forEach(({ event }) => {
              if (network.api.events.system.ExtrinsicSuccess.is(event)) {
                actualTxHash = hash;
                if (!actualTxHash || !transaction.id) return;

                const extrinsicHash = actualTxHash.toHex();

                if (transaction.type === TransactionType.TRANSFER) {
                  db.transactions.update(transaction.id, {
                    ...transaction,
                    transactionHash: actualTxHash.toHex(),
                    status: TransactionStatus.CONFIRMED,
                  });
                } else if (
                  transaction.type === TransactionType.MULTISIG_TRANSFER
                ) {
                  const transactionStatus = isFinalApprove(transaction)
                    ? TransactionStatus.CONFIRMED
                    : TransactionStatus.PENDING;

                  const publicKey = toPublicKey(
                    signWith?.mainAccounts[0].accountId || '',
                  );

                  const { approvals } = transaction.data;
                  const approvalsPayload = {
                    ...approvals,
                    [publicKey]: {
                      ...approvals[publicKey],
                      fromMatrix: true,
                      extrinsicHash,
                    },
                  };

                  db.transactions.update(transaction.id, {
                    status: transactionStatus,
                    data: {
                      ...transaction.data,
                      approvals: approvalsPayload,
                    },
                  });

                  const multisigWallet = transaction.wallet as MultisigWallet;
                  if (signWith && multisigWallet.matrixRoomId) {
                    matrix.setRoom(multisigWallet.matrixRoomId);

                    if (transactionStatus === TransactionStatus.CONFIRMED) {
                      matrix.mstFinalApprove({
                        senderAddress: getAddressFromWallet(
                          signWith,
                          network.network,
                        ),
                        extrinsicHash,
                        chainId: network.network.chainId,
                        callHash: transaction.data.callHash,
                      });
                    }

                    if (transactionStatus === TransactionStatus.PENDING) {
                      matrix.mstApprove({
                        senderAddress: getAddressFromWallet(
                          signWith,
                          network.network,
                        ),
                        extrinsicHash,
                        chainId: network.network.chainId,
                        callHash: transaction.data.callHash,
                      });
                    }
                  }
                }

                history.push(withId(Routes.TRANSFER_DETAILS, transaction.id));
              }
              if (network.api.events.system.ExtrinsicFailed.is(event)) {
                actualTxHash = hash;
                setDialogOpen(true);
              }
            });
        },
      );
    });
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
          <div className="mt-2">Something went wrong</div>

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
