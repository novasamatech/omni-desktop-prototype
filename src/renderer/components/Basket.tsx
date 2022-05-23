import React, { useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useRecoilValue } from 'recoil';
import Transaction from './Transaction';
import LinkButton from '../ui/LinkButton';
import { db, TransactionStatus } from '../db/db';
import { connectionState } from '../store/connections';
import {
  getPendingMultisigTransacions,
  mapTransactionsWithBlockchain,
} from '../utils/transactions';
import { getAddressFromWallet } from '../utils/account';
import { isMultisig } from '../utils/validation';

const Basket: React.FC = () => {
  const transactions = useLiveQuery(() =>
    db.transactions
      .where('status')
      .notEqual(TransactionStatus.CONFIRMED)
      .sortBy('id'),
  );

  const wallets = useLiveQuery(() => db.wallets.toArray());
  const connections = useRecoilValue(connectionState);

  useEffect(() => {
    if (transactions === undefined) return;

    Object.values(connections)
      .map((c) =>
        wallets
          ?.filter(isMultisig)
          .map(async (w) => {
            const pendingTransactions = await getPendingMultisigTransacions(
              c.api,
              getAddressFromWallet(w, c.network),
            );
            const trxs = mapTransactionsWithBlockchain(
              transactions,
              pendingTransactions,
              w,
              c.network,
            );

            trxs.filter(Boolean).forEach((t) => t && db.transactions.add(t));
            return trxs;
          })
          .flat(),
      )
      .flat();
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
