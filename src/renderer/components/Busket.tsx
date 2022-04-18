import React from 'react';
import { Link } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import Button from '../ui/Button';
import { transactionBusketState } from '../store/transactionBusket';
import Transaction from './Transaction';

const ThirdColumn: React.FC = () => {
  const [transactions] = useRecoilState(transactionBusketState);

  return (
    <>
      <div className="flex justify-center items-center">
        <Link className="ml-2 absolute left-0" to="/">
          <Button>Back</Button>
        </Link>
        <h2 className="h-16 p-4 font-light text-lg">
          Review your operations before signing
        </h2>
      </div>

      <div className="m-auto w-1/2">
        {transactions.map((t) => (
          <Transaction key={`${t.address}_${t.type}`} transaction={t} />
        ))}
      </div>
    </>
  );
};

export default ThirdColumn;
