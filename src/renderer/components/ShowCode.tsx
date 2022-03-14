import React, { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { QrDisplayPayload } from '@polkadot/react-qr';
import { Link } from 'react-router-dom';
import { ApiPromise } from '@polkadot/api';
import { apiState } from '../store/api';
import { currentTransactionState } from '../store/currentTransaction';
import Button from '../ui/Button';

const ShowCode: React.FC = () => {
  const [api, setApi] = useState<ApiPromise>();
  const [tx, setTx] = useState<any>();
  const networks = useRecoilValue(apiState);
  const transaction = useRecoilValue(currentTransactionState);

  useEffect(() => {
    if (transaction && networks.length) {
      const network = networks.find(
        (n) => n.network.name === transaction.network
      );
      setApi(network?.api);
      const tempTx = network?.api?.tx.balances.transfer(
        transaction.payload.address,
        transaction.payload.amount
      );
      setTx(tempTx);
    }
  }, [networks, transaction]);

  return (
    <div className="h-screen flex flex-col">
      <h2 className="flex justify-center items-center h-16 p-4 font-light text-lg">
        Sign your operations using Parity Signer
      </h2>
      <div className="flex flex-1 flex-col justify-center items-center">
        <div className="font-normal text-base">
          Scan QR code with Parity Signer
        </div>
        {tx && (
          <div className="w-80 h-80 m-4">
            <QrDisplayPayload
              address={transaction?.address || ''}
              cmd={1}
              genesisHash={api?.genesisHash.toHex() || ''}
              payload={tx.toU8a()}
            />
          </div>
        )}
        <Link to="scan-code">
          <Button fat>Done, upload signed operations</Button>
        </Link>
      </div>
    </div>
  );
};

export default ShowCode;
