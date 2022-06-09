import React from 'react';
import { EventType } from 'matrix-js-sdk';
import LinkButton from '../../ui/LinkButton';
import { useMatrix } from '../Providers/MatrixProvider';
import InviteNotif from './InviteNotif';
import MstNotif from './MstNotif';

const Notifications: React.FC = () => {
  const { notifications } = useMatrix();

  const myNotifications = notifications
    .filter((n) => n.sender !== n.client)
    .reverse();

  return (
    <>
      <div className="h-ribbon flex flex-col">
        <header className="flex justify-center items-center">
          <LinkButton className="ml-2 absolute left-0" to="/">
            Back
          </LinkButton>
          <h1 className="h-16 p-4 font-light text-lg">Notifications</h1>
        </header>

        <main className="w-1/2 mx-auto">
          <ul className="flex flex-col gap-5">
            {myNotifications.map((notif) =>
              notif.type === EventType.RoomMember ? (
                <InviteNotif key={notif.id} notif={notif} />
              ) : (
                <MstNotif key={notif.id} notif={notif} />
              ),
            )}
          </ul>
        </main>
      </div>
    </>
  );
};

export default Notifications;
