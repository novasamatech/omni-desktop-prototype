import React from 'react';
import { format } from 'date-fns';
import { useHistory } from 'react-router';
import LinkButton from '../ui/LinkButton';
import right from '../../../assets/right.svg';
import pending from '../../../assets/pending.svg';
import success from '../../../assets/success.svg';
import { useMatrix } from './Providers/MatrixProvider';
import { db } from '../db/db';
import { BooleanValue } from '../db/types';

const Notifications: React.FC = () => {
  const { notifications } = useMatrix();
  const history = useHistory();

  const onDetailsNavigation = (id: string, isRead: boolean) => () => {
    if (!isRead) {
      db.mxNotifications.update(id, { isRead: BooleanValue.POSITIVE });
    }

    // TODO: got to chat, invites, etc.
    history.push('/');
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
                  {format(n.date, 'HH:mm:ss')}
                </span>
                <button
                  className="flex items-center gap-2"
                  type="button"
                  onClick={onDetailsNavigation(n.id, n.isRead)}
                >
                  <span className="text-sm">Details</span>
                  <img src={right} alt="" />
                </button>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-medium">{n.title}</div>
                <div className="text-gray-500 mt-1">{n.description}</div>
              </div>
              <img
                className="ml-auto"
                src={n.isRead ? success : pending}
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
