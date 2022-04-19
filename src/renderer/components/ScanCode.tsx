import React from 'react';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import { Link, useHistory } from 'react-router-dom';
import { QrScanSignature } from '@polkadot/react-qr';
import { GenericExtrinsic } from '@polkadot/types';
import {
  getRegistry,
  GetRegistryOpts,
  createMetadata,
  OptionsWithMeta,
  UnsignedTransaction,
} from '@substrate/txwrapper-polkadot';
import { connectionState } from '../store/api';
import { transactionBusketState } from '../store/transactionBusket';
import {
  currentTransactionState,
  currentUnsignedState,
} from '../store/currentTransaction';
import Button from '../ui/Button';

function createSignedTx(
  unsigned: UnsignedTransaction,
  signature: `0x${string}`,
  options: OptionsWithMeta
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
    { version: unsigned.version }
  );

  extrinsic.addSignature(unsigned.address, signature, unsigned);

  return extrinsic;
}

const ScanCode: React.FC = () => {
  const networks = useRecoilValue(connectionState);
  const history = useHistory();

  const setTransactions = useSetRecoilState(transactionBusketState);

  const transaction = useRecoilValue(currentTransactionState);
  const unsigned = useRecoilValue(currentUnsignedState);

  const onGetSignature = async (payload: any) => {
    const signature = payload.signature || '';
    if (transaction && unsigned && Object.values(networks).length) {
      const network = Object.values(networks).find(
        (n) => n.network.name === transaction.network
      );

      if (network && network.api) {
        const metadataRpc = await network.api.rpc.state.getMetadata();
        const { specVersion, specName } =
          await network.api.rpc.state.getRuntimeVersion();

        const registry = getRegistry({
          chainName: network?.network.name || '',
          specName: specName.toString() as GetRegistryOpts['specName'],
          specVersion: specVersion.toNumber(),
          metadataRpc: metadataRpc.toHex(),
        });

        const tx = createSignedTx(unsigned, signature, {
          metadataRpc: metadataRpc.toHex(),
          registry,
        });

        const actualTxHash = await network.api.rpc.author.submitExtrinsic(tx);

        if (actualTxHash) {
          setTransactions((trxs) => {
            return trxs.filter((t) => t !== transaction);
          });
          history.push('/busket');
        }
      }
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex justify-center items-center">
        <Link className="ml-2 absolute left-0" to="/show-code">
          <Button>Back</Button>
        </Link>
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
