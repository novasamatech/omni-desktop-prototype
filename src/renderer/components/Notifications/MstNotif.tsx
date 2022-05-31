import React from 'react';
import { format } from 'date-fns';
import { useHistory } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import {
  BooleanValue,
  Notification,
  TransactionStatus,
  TransactionType,
} from '../../db/types';
import { OmniMstEvents, MstParams } from '../../modules/types';
import NotifyItem from './NotifyItem';
import { Routes, withId } from '../../../common/constants';

const TITLES = {
  [OmniMstEvents.INIT]: 'MST initiated',
  [OmniMstEvents.APPROVE]: 'MST approved',
  [OmniMstEvents.FINAL_APPROVE]: 'MST executed',
  [OmniMstEvents.CANCEL]: 'MST cancelled',
};

const DESCRIPTIONS = {
  [OmniMstEvents.INIT]: (sender: string) =>
    `The transaction was initiated by ${sender}`,
  [OmniMstEvents.APPROVE]: (sender: string) =>
    `The transaction was approved by ${sender}`,
  [OmniMstEvents.FINAL_APPROVE]: (sender: string) =>
    `The transaction was executed by ${sender}`,
  [OmniMstEvents.CANCEL]: (sender: string) =>
    `The transaction was cancelled by ${sender}`,
};

const Statuses = {
  [OmniMstEvents.INIT]: TransactionStatus.CREATED,
  [OmniMstEvents.APPROVE]: TransactionStatus.PENDING,
  [OmniMstEvents.FINAL_APPROVE]: TransactionStatus.CONFIRMED,
  [OmniMstEvents.CANCEL]: TransactionStatus.CANCELLED,
};

type Props = {
  notif: Notification;
};

const MstNotif: React.FC<Props> = ({ notif }) => {
  const history = useHistory();
  const type = notif.type as OmniMstEvents;

  const transactions = useLiveQuery(() => db.transactions.toArray());
  const wallets = useLiveQuery(() => db.wallets.toArray());

  const onDetailsClick = async () => {
    if (!notif.isRead) {
      db.mxNotifications.update(notif, {
        isRead: BooleanValue.TRUE,
      });
    }

    const content = notif.content as MstParams;

    const transaction = transactions?.find(
      (t) => t.data.callHash === content.callHash,
    );

    if (transaction?.id) {
      history.push(withId(Routes.TRANSFER_DETAILS, transaction.id));
    } else {
      const transactionStatus = Statuses[type];
      const wallet = wallets?.find(
        (w) => w.mainAccounts[0].accountId === content.senderAddress,
      );

      if (!wallet?.id) return;

      const id = db.transactions.add({
        wallet,
        status: transactionStatus,
        createdAt: notif.date,
        address: content.senderAddress,
        chainId: content.chainId,
        data: {
          callHash: content.callHash,
          callData: content.callData,
        },
        type: TransactionType.MULTISIG_TRANSFER,
      });

      history.push(withId(Routes.TRANSFER_DETAILS, id));
    }
  };

  return (
    <NotifyItem
      title={TITLES[type]}
      description={DESCRIPTIONS[type](notif.sender)}
      date={format(notif.date, 'HH:mm:ss dd MMM, yyyy')}
      isRead={Boolean(notif.isRead)}
      onClick={onDetailsClick}
    />
  );
};

export default MstNotif;
