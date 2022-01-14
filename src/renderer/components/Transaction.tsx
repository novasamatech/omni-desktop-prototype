import React from 'react';
import { useSetRecoilState } from 'recoil';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import { TransactionData } from '../../common/types';
import { currentTransactionState } from '../store/currentTransaction';
import Address from '../ui/Address';

type Props = {
  transaction: TransactionData;
};

const Transaction: React.FC<Props> = ({ transaction }: Props) => {
  const setCurrentTransaction = useSetRecoilState(currentTransactionState);
  const sendTransaction = () => {
    console.log('send transaction');
  };

  return (
    <div className="bg-gray-100 p-4 m-4 rounded-lg">
      <div className="flex">
        From: <Address address={transaction.address} />
      </div>
      <div>Type: {transaction.type}</div>
      <div className="flex">
        Destination: <Address address={transaction.payload.address} />
      </div>
      <div>Value: {transaction.payload.amount}</div>

      {transaction.signature ? (
        <Button onClick={() => sendTransaction()}>
          Send to the blockchain
        </Button>
      ) : (
        <Link to="show-code">
          <Button onClick={() => setCurrentTransaction(transaction)}>
            Show QR Code
          </Button>
        </Link>
      )}
    </div>
  );
};

export default Transaction;
