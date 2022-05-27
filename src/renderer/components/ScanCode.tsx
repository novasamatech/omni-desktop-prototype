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
import { uniq } from 'lodash';

import { connectionState } from '../store/connections';
import {
  currentTransactionState,
  currentUnsignedState,
  signByState,
} from '../store/currentTransaction';
import { HexString } from '../../common/types';
import LinkButton from '../ui/LinkButton';
import { Routes, withId } from '../../common/constants';
import { db } from '../db/db';
import { TransactionStatus, TransactionType } from '../db/types';
import { isFinalApprove } from '../utils/transactions';
import { formatAddress } from '../utils/account';

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

  const [isTxSent, setIsTxSent] = useState(false);

  const transaction = useRecoilValue(currentTransactionState);
  const signBy = useRecoilValue(signByState);
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
    const actualTxHash = await network.api.rpc.author.submitExtrinsic(tx);

    console.log('act', actualTxHash);
    if (!actualTxHash || !transaction.id) return;

    if (transaction.type === TransactionType.TRANSFER) {
      db.transactions.update(transaction.id, {
        ...transaction,
        status: TransactionStatus.CONFIRMED,
      });
    } else if (transaction.type === TransactionType.MULTISIG_TRANSFER) {
      const transactionStatus = isFinalApprove(transaction)
        ? TransactionStatus.CONFIRMED
        : TransactionStatus.PENDING;

      db.transactions.put({
        ...transaction,
        status: transactionStatus,
        transactionHash: actualTxHash.toHex(),
        data: {
          ...transaction.data,
          approvals: uniq([
            ...transaction.data.approvals,
            formatAddress(
              signBy?.mainAccounts[0].accountId || '',
              network.network.addressPrefix,
            ),
          ]),
        },
      });
    }

    history.push(withId(Routes.TRANSFER_DETAILS, transaction.id));
  };

  return (
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
        {transaction && (
          <div className="w-80 h-80 m-4">
            <QrScanSignature onScan={onGetSignature} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanCode;
