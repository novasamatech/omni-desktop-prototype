import React from 'react';
import { format } from 'date-fns';
import { useHistory } from 'react-router';
import { db } from '../../db/db';
import { BooleanValue, Notification } from '../../db/types';
import { OmniMstEvents } from '../../modules/types';
import NotifyItem from './NotifyItem';

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

type Props = {
  notif: Notification;
};

const MstNotif: React.FC<Props> = ({ notif }) => {
  const history = useHistory();

  const onDetailsClick = () => {
    if (!notif.isRead) {
      db.mxNotifications.update(notif, {
        isRead: BooleanValue.TRUE,
      });
    }

    // TODO: got to MST details, etc.
    history.push('/');
  };

  return (
    <NotifyItem
      title={TITLES[notif.type as OmniMstEvents]}
      description={DESCRIPTIONS[notif.type as OmniMstEvents](notif.sender)}
      date={format(notif.date, 'HH:mm:ss dd MMM, yyyy')}
      isRead={Boolean(notif.isRead)}
      onClick={onDetailsClick}
    />
  );
};

export default MstNotif;
