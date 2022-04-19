/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import React, { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { QrDisplayPayload } from '@polkadot/react-qr';
import {
  construct,
  getRegistry,
  methods,
  GetRegistryOpts,
} from '@substrate/txwrapper-polkadot';
import { Link } from 'react-router-dom';
import { ApiPromise } from '@polkadot/api';
import { connectionState } from '../store/api';
import {
  currentTransactionState,
  currentUnsignedState,
} from '../store/currentTransaction';
import Button from '../ui/Button';

const ShowCode: React.FC = () => {
  const [api, setApi] = useState<ApiPromise>();
  const [payload, setPayload] = useState<Uint8Array>();
  const networks = useRecoilValue(connectionState);
  const transaction = useRecoilValue(currentTransactionState);
  const [transactionPayload, setUnsigned] =
    useRecoilState(currentUnsignedState);

  useEffect(() => {
    const setupTransaction = async () => {
      if (transaction && Object.values(networks).length) {
        const network = Object.values(networks).find(
          (n) => n.network.name === transaction.network
        );

        setApi(network?.api);

        if (network && network.api) {
          const { block } = await network.api.rpc.chain.getBlock();
          const blockHash = await network.api.rpc.chain.getBlockHash();
          const genesisHash = await network.api.rpc.chain.getBlockHash(0);
          const metadataRpc = await network.api.rpc.state.getMetadata();
          const { specVersion, transactionVersion, specName } =
            await network.api.rpc.state.getRuntimeVersion();

          const registry = getRegistry({
            chainName: network?.network.name || '',
            specName: specName.toString() as GetRegistryOpts['specName'],
            specVersion: specVersion.toNumber(),
            metadataRpc: metadataRpc.toHex(),
          });

          const { nonce } = await network?.api?.query.system.account(
            transaction.address
          );

          const unsigned = methods.balances.transfer(
            {
              value: transaction.payload.amount,
              dest: transaction.payload.address,
            },
            {
              address: transaction.address,
              blockHash: blockHash.toString(),
              blockNumber: registry
                .createType('BlockNumber', block.header.number)
                .toNumber(),
              eraPeriod: 64,
              genesisHash: genesisHash.toString(),
              metadataRpc: metadataRpc.toHex(),
              nonce: nonce.toNumber(),
              specVersion: specVersion.toNumber(),
              tip: 0,
              transactionVersion: transactionVersion.toNumber(),
            },
            {
              metadataRpc: metadataRpc.toHex(),
              registry,
            }
          );
          const signingPayloadHex = construct.signingPayload(unsigned, {
            registry,
          });

          const fromHexString = (hexString: string) => {
            const array = hexString.match(/.{1,2}/g);
            if (array && array.length > 0) {
              array.shift();
              return new Uint8Array(array.map((byte) => parseInt(byte, 16)));
            }

            return new Uint8Array([]);
          };

          setPayload(fromHexString(signingPayloadHex));

          setUnsigned(unsigned);
        }
      }
    };

    setupTransaction();
  }, [networks, transaction, setUnsigned]);

  return (
    <div className="h-screen flex flex-col">
      <div className="flex justify-center items-center">
        <Link className="ml-2 absolute left-0" to="/busket">
          <Button>Back</Button>
        </Link>
        <h2 className="h-16 p-4 font-light text-lg">
          Sign your operations using Parity Signer
        </h2>
      </div>
      <div className="flex flex-1 flex-col justify-center items-center">
        <div className="font-normal text-base">
          Scan QR code with Parity Signer
        </div>

        {api && payload && transaction && (
          <div className="w-80 h-80 m-4">
            <QrDisplayPayload
              address={transaction.address || ''}
              cmd={0}
              genesisHash={api.genesisHash.toHex() || ''}
              payload={payload}
            />
          </div>
        )}
        <Link to="/scan-code">
          <Button fat>Done, upload signed operations</Button>
        </Link>
      </div>
    </div>
  );
};

export default ShowCode;
