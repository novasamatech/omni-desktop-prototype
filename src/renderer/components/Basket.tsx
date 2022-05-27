import React, { useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useRecoilValue } from 'recoil';
import Transaction from './Transaction';
import LinkButton from '../ui/LinkButton';
import { db } from '../db/db';
import { connectionState } from '../store/connections';
import { updateTransactions } from '../utils/transactions';
import { isMultisig } from '../utils/validation';

const Basket: React.FC = () => {
  const transactions = useLiveQuery(() =>
    db.transactions.toCollection().reverse().sortBy('id'),
  );

  const wallets = useLiveQuery(() => db.wallets.toArray());
  const connections = useRecoilValue(connectionState);

  useEffect(() => {
    if (!transactions || !wallets) return;

    wallets.filter(isMultisig).forEach((w) => {
      Object.values(connections).forEach(async (c) => {
        await updateTransactions(transactions, w, c);
      });
    });
  }, [wallets, connections, transactions]);

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
          <Transaction
            key={`${t.address}_${t.createdAt.toString()}`}
            transaction={t}
          />
        ))}
      </div>
    </>
  );
};

export default Basket;
