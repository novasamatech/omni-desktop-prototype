import React from 'react';
import { format } from 'date-fns';
import { useHistory } from 'react-router';
import { EventType } from 'matrix-js-sdk';
import LinkButton from '../ui/LinkButton';
import right from '../../../assets/right.svg';
import { Notification, useMatrix } from './Providers/MatrixProvider';
import { db } from '../db/db';
import { BooleanValue } from '../db/types';
import Status from '../ui/Status';
import { Routes, StatusType, withId } from '../../common/constants';
import { OMNI_MST_EVENTS } from '../modules/constants';
import { OmniExtras } from '../modules/types';

const Notifications: React.FC = () => {
  const history = useHistory();
  const { notifications } = useMatrix();

  const handleInviteNotification = (notification: Notification) => async () => {
    if (notification.isRead) {
      const mstAddress = (notification.rawData.content as OmniExtras)
        .mst_account.address;
      const multisigWallets = await db.wallets
        .where('threshold')
        .above('0')
        .toArray();
      const mstAccountId = multisigWallets.find((m) =>
        m.mainAccounts.some((a) => a.accountId === mstAddress),
      )?.id;

      if (mstAccountId) {
        history.push(withId(Routes.WALLET, mstAccountId));
      } else {
        console.log('MST account not found');
      }
    } else {
      console.log(123);
      // show modal
      // join room
    }
  };

  const handleMstNotification = (notification: Notification) => () => {
    if (!notification.isRead) {
      db.mxNotifications.update(notification.id, {
        isRead: BooleanValue.POSITIVE,
      });
    }

    // TODO: got to MST details, etc.
    history.push('/');
  };

  const onDetailsClick = (notification: Notification) => () => {
    const isInviteNotification =
      notification.rawData.type === EventType.RoomMember;

    const isMstNotification = Object.values(OMNI_MST_EVENTS).includes(
      notification.rawData.type,
    );

    if (isInviteNotification) {
      handleInviteNotification(notification);
    }
    if (isMstNotification) {
      handleMstNotification(notification);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="flex justify-center items-center">
        <LinkButton className="ml-2 absolute left-0" to="/">
          Back
        </LinkButton>
        <h1 className="h-16 p-4 font-light text-lg">Notifications</h1>
      </header>

      <main className="overflow-y-auto">
        <ul className="flex flex-col w-1/3 mx-auto gap-5">
          {notifications.map((n) => (
            <li className="bg-gray-100 p-4 rounded-lg" key={n.id}>
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">
                  {format(n.date, 'HH:mm:ss dd MMM, yyyy')}
                </span>
                <button
                  className="flex items-center gap-2"
                  type="button"
                  onClick={onDetailsClick(n)}
                >
                  <span className="text-sm">Details</span>
                  <img src={right} alt="" />
                </button>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-medium">{n.title}</div>
                <div className="text-gray-500 mt-1">{n.description}</div>
              </div>
              <Status
                className="ml-auto"
                status={n.isRead ? StatusType.SUCCESS : StatusType.WAITING}
                alt={n.isRead ? 'is read' : 'is not read'}
              />
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
};

export default Notifications;
