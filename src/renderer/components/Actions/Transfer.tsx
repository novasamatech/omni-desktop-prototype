import React, { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { QrDisplayPayload, QrScanSignature } from '@polkadot/react-qr';
// import { createType } from '@polkadot/types';
import type { HexString } from '@polkadot/util/types';
// import { methods } from '@substrate/txwrapper-polkadot';
// import { TypeRegistry } from '@polkadot/types';
import { apiState } from '../../store/Api';

// import { QrScanSignature } from '@polkadot/react-qr';
// import { ApiPromise } from '@polkadot/api';
// import { Keyring } from '@polkadot/keyring';
type ScanType = {
  signature: HexString;
};

const Transfer: React.FC = () => {
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState(0);
  const [payload, setPayload] = useState<any>(undefined);

  const api = useRecoilValue(apiState);

  useEffect(() => {
    console.log('api', api);
  }, [api]);

  const showQrCode = async () => {
    if (api) {
      console.log(1);
      const tx = api.tx.balances.transfer(address, amount);
      console.log('tx', tx.toHex());
      setPayload(tx);

      // if (api) {
      //   const tx = api.tx.balances.transfer(address, amount);
      //   console.log('tx', tx);
      // }
      // console.log(api?.genesisHash.toString());
      // console.log(api?.runtimeMetadata.toString());
      // const signedBlock = await api.rpc.chain.getBlock();
      // console.log(signedBlock.block.header.number);
      // const rpcMetadata = await api?.rpc.state.getMetadata();
      // console.log('rpcMetadata', rpcMetadata.toHex());

      // const unsigned = methods.balances.transfer(
      //   {
      //     dest: address,
      //     value: amount,
      //   },
      //   {
      //     address,
      //     blockHash: signedBlock.block.header.parentHash.toString() || '',
      //     blockNumber: signedBlock.block.header.number.toNumber() || 0,
      //     genesisHash: api?.genesisHash.toString() || '',
      //     metadataRpc: api?.runtimeMetadata.toHex() || '',
      //     nonce: 0,
      //     specVersion: api?.runtimeVersion.specVersion.toNumber() || 0,
      //     transactionVersion:
      //       api?.runtimeVersion.transactionVersion.toNumber() || 0,
      //   },
      //   {
      //     metadataRpc: api?.runtimeMetadata.toHex() || '',
      //     registry: new TypeRegistry(),
      //   }
      // );
      // console.log(unsigned);
    }
  };

  const onGetSignature = async ({ signature }: ScanType) => {
    console.log(signature);
    // const signedBlock = await api.rpc.chain.getBlock();
    // const currentHeight = signedBlock.block.header.number;
    // const era = createType('ExtrinsicEra', {
    //   current: currentHeight,
    //   period: 10,
    // });
    // const blockHash = signedBlock.block.header.hash;
    // const nonce = await api.query.system.accountNonce(address);
    // const genesisHash = await api.genesisHash;
    // const specVersion = await api.runtimeVersion.specVersion;

    // const txPayload = createType(
    //   'ExtrinsicPayload',
    //   {
    //     blockHash: blockHash.toHex(),
    //     era: era.toHex(),
    //     genesisHash: genesisHash.toHex(),
    //     method: payload.toHex(),
    //     nonce: nonce.toHex(),
    //     specVersion: specVersion.toHex(),
    //     tip: '',
    //   },
    //   {
    //     version: 3,
    //   }
    // );

    // payload.addSignature(address, signature, txPayload);
    // const hash = await payload.send();
    // console.log(hash);
  };

  return (
    <>
      {payload && (
        <>
          <QrDisplayPayload
            address={address}
            cmd={1}
            genesisHash={api?.genesisHash.toHex() || ''}
            payload={payload?.toU8a()}
          />
          <QrScanSignature onScan={onGetSignature} />
        </>
      )}

      <div className="p-2">
        <input
          className="w-full p-2"
          placeholder="Account Name"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
        />
      </div>
      <div className="p-2">
        <input
          className="w-full p-2"
          placeholder="Amount"
          value={amount}
          type="number"
          onChange={(event) => setAmount(parseFloat(event.target.value))}
        />
      </div>
      <div className="p-2">
        <button
          type="button"
          className="w-full p-2 rounded border-solid border-2 border-gray-200"
          onClick={showQrCode}
        >
          Show QR code
        </button>
      </div>
    </>
  );
};

export default Transfer;
