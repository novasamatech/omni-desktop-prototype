import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { renderRoutes, RouteConfig } from 'react-router-config';
import cn from 'classnames';
import { db } from '../../db/db';
import { TransactionStatus } from '../../db/types';
import FirstColumn from '../FirstColumn';
import SecondColumn from '../SecondColumn';
import LinkButton from '../../ui/LinkButton';
import { Routes } from '../../../common/constants';
import { useMatrix } from '../Providers/MatrixProvider';

type Props = {
  route?: RouteConfig;
};

const MainLayout: React.FC<Props> = ({ route }) => {
  const { matrix, notifications } = useMatrix();

  const transactions = useLiveQuery(() =>
    db.transactions
      .where('status')
      .notEqual(TransactionStatus.CONFIRMED)
      .toArray(),
  );

  const isTransactionsExist = transactions && transactions.length > 0;
  const hasUnread = notifications.some(
    (n) => n.sender !== n.client && !n.isRead,
  );

  return (
    <div className="flex h-ribbon">
      <FirstColumn />
      <SecondColumn />
      <div className={cn('flex-1 overflow-auto pb-20')}>
        {renderRoutes(route?.routes)}
      </div>

      <div className="flex fixed bottom-0 w-screen bg-gray-100 p-3">
        <div className="flex items-center">
          <LinkButton to={Routes.BASKET} size="md">
            Operations
          </LinkButton>
          {isTransactionsExist && (
            <div className="ml-3">
              {transactions.length} pending{' '}
              {transactions.length > 1 ? 'operations' : 'operation'}
            </div>
          )}
        </div>
        {matrix.isLoggedIn && (
          <LinkButton
            className={cn('ml-auto', hasUnread && 'bg-red-400')}
            to={Routes.NOTIFICATIONS}
            size="md"
          >
            Notifications
          </LinkButton>
        )}
      </div>
    </div>
  );
};

export default MainLayout;
