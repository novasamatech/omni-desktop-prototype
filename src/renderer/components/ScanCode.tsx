import React from 'react';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import { Link, useHistory } from 'react-router-dom';
import { QrScanSignature } from '@polkadot/react-qr';
import { connectionState } from '../store/api';
import { transactionBusketState } from '../store/transactionBusket';
import { currentTransactionState } from '../store/currentTransaction';
import Button from '../ui/Button';

const ScanCode: React.FC = () => {
  const connections = useRecoilValue(connectionState);
  const history = useHistory();

  const setTransactions = useSetRecoilState(transactionBusketState);

  const transaction = useRecoilValue(currentTransactionState);
  const tx = connections[0].api?.tx.balances.transfer(
    transaction?.payload.address,
    transaction?.payload.amount
  );

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
      <div className="flex justify-between items-center">
        <Link className="ml-2" to="/show-code">
          <Button>Back</Button>
        </Link>
        <h2 className="h-16 p-4 font-light text-lg">
          Upload signed operations via Parity Signer
        </h2>
        <div />
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
