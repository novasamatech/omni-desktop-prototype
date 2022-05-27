import React from 'react';
import { useMatrix } from '../Providers/MatrixProvider';
import { Routes } from '../../../common/constants';
import LinkButton from '../../ui/LinkButton';
import arrowUp from '../../../../assets/arrow-up.svg';

const Chat: React.FC = () => {
  const { matrix, notifications } = useMatrix();
  console.log(notifications);

  if (matrix.isLoggedIn) {
    return (
      <div className="mb-10 w-[350px] bg-gray-100 px-4 py-3 rounded-2xl">
        <h2 className="text-2xl font-normal mb-6">Chat</h2>
        <div className="flex flex-col items-center justify-center h-full -mt-14">
          <p className="mb-4">You are not logged in to Matrix</p>
          <LinkButton className="w-max" to={Routes.LOGIN}>
            Login
          </LinkButton>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-10 w-[350px] bg-gray-100 px-4 py-3 rounded-2xl">
      <h2 className="text-2xl font-normal mb-6">Chat</h2>
      <div className="flex flex-col h-full -mt-14">
        {/* chat room */}
        {/* input */}
        <div className="relative">
          <input
            className="border-2"
            type="text"
            placeholder="Write message..."
          />
          <img className="absolute" src={arrowUp} alt="" />
        </div>
      </div>
    </div>
  );
};

export default Chat;
