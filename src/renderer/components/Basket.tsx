import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import Transaction from './Transaction';
import LinkButton from '../ui/LinkButton';
import { db } from '../db/db';

const ThirdColumn: React.FC = () => {
  const transactions = useLiveQuery(() => db.transactions.toArray());

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
        {transactions?.map((t) => (
          <Transaction key={`${t.createdAt}_${t.type}`} transaction={t} />
        ))}
      </div>
    </>
  );
};

export default ThirdColumn;
