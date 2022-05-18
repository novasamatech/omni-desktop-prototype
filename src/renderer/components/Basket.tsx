import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import Transaction from './Transaction';
import LinkButton from '../ui/LinkButton';
import { db, TransactionStatus } from '../db/db';

const Basket: React.FC = () => {
  const transactions = useLiveQuery(() =>
    db.transactions
      .where('status')
      .notEqual(TransactionStatus.CONFIRMED)
      .toArray(),
  );

  return (
    <>
      <div className="flex justify-center items-center">
        <LinkButton className="ml-2 absolute left-0" to="/">
          Back
        </LinkButton>
        <h2 className="h-16 p-4 font-light text-lg">
          Review your operations before signing
        </h2>
      </div>

      <div className="m-auto w-1/2">
        {transactions?.reverse().map((t) => (
          <Transaction key={`${t.createdAt}_${t.address}`} transaction={t} />
        ))}
      </div>
    </>
  );
};

export default Basket;
