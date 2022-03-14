import React from 'react';
import { useRecoilState } from 'recoil';
import { transactionBusketState } from '../store/transactionBusket';
import Transaction from './Transaction';

const ThirdColumn: React.FC = () => {
  const [transactions] = useRecoilState(transactionBusketState);

  return (
    <>
      <div className="w-screen flex items-center justify-center">
        <h2 className="p-4 font-normal">
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
