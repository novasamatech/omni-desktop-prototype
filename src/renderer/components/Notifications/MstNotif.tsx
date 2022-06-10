import React from 'react';
import { format } from 'date-fns';
import { useHistory } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { BooleanValue, Notification } from '../../db/types';
import { OmniMstEvents, MstParams } from '../../modules/types';
import NotifyItem from './NotifyItem';
import { Routes, withId } from '../../../common/constants';

const TITLES = {
  [OmniMstEvents.INIT]: 'Operation was initiated',
  [OmniMstEvents.APPROVE]: 'Operation was signed',
  [OmniMstEvents.FINAL_APPROVE]: 'Executed after final signing',
  [OmniMstEvents.CANCEL]: 'Operation was cancelled',
};

const DESCRIPTIONS = {
  [OmniMstEvents.INIT]: (sender: string) =>
    `The transaction was initiated by ${sender}`,
  [OmniMstEvents.APPROVE]: (sender: string) =>
    `The transaction was signed by ${sender}`,
  [OmniMstEvents.FINAL_APPROVE]: (sender: string) =>
    `The transaction was executed by ${sender}`,
  [OmniMstEvents.CANCEL]: (sender: string) =>
    `The transaction was cancelled by ${sender}`,
};

type Props = {
  notif: Notification;
};

const MstNotif: React.FC<Props> = ({ notif }) => {
  const history = useHistory();
  const type = notif.type as OmniMstEvents;

  const transactions = useLiveQuery(() => db.transactions.toArray());

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
    }
  };

  return (
    <NotifyItem
      title={TITLES[type]}
      description={DESCRIPTIONS[type](notif.sender)}
      date={format(notif.date, 'HH:mm:ss dd MMM, yyyy')}
      callHash={(notif.content as MstParams).callHash}
      isRead={Boolean(notif.isRead)}
      onClick={onDetailsClick}
    />
  );
};

export default MstNotif;
