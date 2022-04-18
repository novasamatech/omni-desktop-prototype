import React, { useEffect, useState } from 'react';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import { Link, useHistory } from 'react-router-dom';
import { QrScanSignature } from '@polkadot/react-qr';
import { connectionState } from '../store/api';
import { transactionBusketState } from '../store/transactionBusket';
import { currentTransactionState } from '../store/currentTransaction';
import Button from '../ui/Button';

const ScanCode: React.FC = () => {
  const networks = useRecoilValue(connectionState);
  const [tx, setTx] = useState<any>();

  const history = useHistory();

  const setTransactions = useSetRecoilState(transactionBusketState);

  const transaction = useRecoilValue(currentTransactionState);

  useEffect(() => {
    if (transaction && Object.values(networks).length) {
      const network = Object.values(networks).find(
        (n) => n.network.name === transaction.network
      );

      const tempTx = network?.api?.tx.balances.transfer(
        transaction.payload.address,
        transaction.payload.amount
      );

      setTx(tempTx);
    }
  }, [networks, transaction]);

  const onGetSignature = (payload: any) => {
    const signature = payload.signature || '';

    if (signature) {
      tx.addSignature(transaction?.address || '', signature, tx.toU8a());
      tx.send();
    }

    if (signature && transaction) {
      setTransactions((trxs) => {
        return trxs.filter((t) => t !== transaction);
      });

      history.push('/busket');
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
        {tx && (
          <div className="w-80 h-80 m-4">
            <QrScanSignature onScan={onGetSignature} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanCode;
