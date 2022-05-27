/* eslint-disable promise/always-return */
import React, { useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { useHistory, useParams } from 'react-router';
import Button from '../../ui/Button';
import { currentTransactionState } from '../../store/currentTransaction';
import { Routes } from '../../../common/constants';
import { db } from '../../db/db';
import { Chain, Transaction } from '../../db/types';
import LinkButton from '../../ui/LinkButton';
import Details from './Details';
import Signatories from './Signatories';
import Chat from './Chat';

const TransferDetails: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();

  const [transaction, setTransaction] = useState<Transaction>();
  const [network, setNetwork] = useState<Chain>();
  const setCurrentTransaction = useSetRecoilState(currentTransactionState);

  useEffect(() => {
    if (!id) return;

    db.transactions
      .get(Number(id))
      .then((tx) => {
        if (tx) {
          setTransaction(tx);
        }
      })
      .catch((e) => console.log(e));
  }, [id]);

  useEffect(() => {
    if (!transaction?.chainId) return;

    db.chains
      .get({ chainId: transaction.chainId })
      .then((chain) => {
        if (chain) {
          setNetwork(chain);
        }
      })
      .catch((e) => console.log(e));
  }, [transaction?.chainId]);

  const showQR = () => {
    setCurrentTransaction(transaction);
    history.push(Routes.SHOW_CODE);
  };

  const onRemoveTransaction = () => {
    if (transaction?.id) {
      db.transactions.delete(transaction.id);
      history.push(Routes.BASKET);
    }
  };

  return (
    <>
      <div className="flex justify-center items-center mb-8">
        <LinkButton className="ml-2 absolute left-0" to={Routes.BASKET}>
          Back
        </LinkButton>
        <h1 className="h-16 p-4 font-light text-lg">Operation details</h1>
      </div>

      <div className="flex justify-center gap-6">
        <Details
          network={network}
          transaction={transaction}
          onRemove={onRemoveTransaction}
        />
        <Signatories network={network} transaction={transaction} />
        <Chat />
      </div>
      <div className="mx-auto mb-10 w-[350px]">
        <Button className="w-full" size="lg" onClick={showQR}>
          Send for signing
        </Button>
      </div>
    </>
  );
};

export default TransferDetails;
