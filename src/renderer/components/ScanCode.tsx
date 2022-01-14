import React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useHistory } from 'react-router-dom';
import { QrScanSignature } from '@polkadot/react-qr';
import { apiState } from '../store/api';
import { transactionBusketState } from '../store/transactionBusket';

const ScanCode: React.FC = () => {
  const api = useRecoilValue(apiState);
  const history = useHistory();

  const [transactions, setTransactions] = useRecoilState(
    transactionBusketState
  );
  const transaction = transactions[0];
  const tx = api?.tx.balances.transfer(
    transaction.payload.address,
    transaction.payload.amount
  );

  const onGetSignature = (payload: any) => {
    const signature = payload.signature || '';

    if (signature) {
      setTransactions((trxs) => {
        trxs.filter((t) => t !== transaction);

        return [
          ...trxs,
          {
            ...transaction,
            signature,
          },
        ];
      });

      history.push('/busket');
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <h2 className="flex justify-center items-center h-16 font-light text-lg">
        Upload signed operations via Parity Signer
      </h2>
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
