import React from 'react';
import { Link } from 'react-router-dom';
import LinkButton from '../ui/LinkButton';
import arrow from '../../../assets/arrow.svg';
import statusWait from '../../../assets/status-wait.svg';
import statusRead from '../../../assets/status-read.svg';
import { useMatrix } from './Providers/MatrixProvider';

const Notifications: React.FC = () => {
  const { notifications } = useMatrix();

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
          {notifications.map((notification) => (
            <li className="bg-gray-100 p-4 rounded-lg">
              <div className="flex justify-between">
                {/* <span className="text-gray-500 text-sm">{notification.time}</span> */}
                <span className="text-gray-500 text-sm">10.02.2022</span>
                <Link className="flex items-center gap-2" to="/">
                  <span className="text-sm">Details</span>
                  <img src={arrow} alt="" />
                </Link>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-medium">
                  {/* {notification.title} */}
                  Notification MST initialized
                </div>
                <div className="text-gray-500 mt-1">
                  {/* {notification.description} */}
                  The wallet does not have enough balance to cover the
                  transaction costs.
                </div>
              </div>
              <img
                className="ml-auto"
                src={notification.status === 'read' ? statusRead : statusWait}
                alt="notification not read"
              />
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
};

export default Notifications;
