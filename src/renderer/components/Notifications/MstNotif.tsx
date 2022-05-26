import React from 'react';
import { format } from 'date-fns';
import { useHistory } from 'react-router';
import { EventType } from 'matrix-js-sdk';
import right from '../../../../assets/right.svg';
import Status from '../../ui/Status';
import { StatusType } from '../../../common/constants';
import { db } from '../../db/db';
import { BooleanValue, Notification } from '../../db/types';
import { OmniMstEvents } from '../../modules/types';

const TITLES = {
  [OmniMstEvents.INIT]: 'MST initiated',
  [OmniMstEvents.APPROVE]: 'MST approved',
  [OmniMstEvents.FINAL_APPROVE]: 'MST executed',
  [OmniMstEvents.CANCEL]: 'MST cancelled',
  [EventType.RoomMember]: 'Room invitation',
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

  const onDetailsCLick = () => {
    if (!notif.isRead) {
      db.mxNotifications.update(notif, {
        isRead: BooleanValue.TRUE,
      });
    }

    // TODO: got to MST details, etc.
    history.push('/');
  };

  return (
    <li className="bg-gray-100 p-4 rounded-lg">
      <div className="flex justify-between">
        <span className="text-gray-500 text-sm">
          {format(notif.date, 'HH:mm:ss dd MMM, yyyy')}
        </span>
        <button
          className="flex items-center gap-2"
          type="button"
          onClick={onDetailsCLick}
        >
          <span className="text-sm">Details</span>
          <img src={right} alt="" />
        </button>
      </div>
      <div className="mt-3">
        <div className="text-2xl font-medium">{TITLES[notif.type]}</div>
        <div className="text-gray-500 mt-1">
          {DESCRIPTIONS[notif.type as OmniMstEvents](notif.sender)}
        </div>
      </div>
      <Status
        className="ml-auto"
        status={notif.isRead ? StatusType.SUCCESS : StatusType.WAITING}
        alt={notif.isRead ? 'is read' : 'is not read'}
      />
    </li>
  );
};

export default MstNotif;
