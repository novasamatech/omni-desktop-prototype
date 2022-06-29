import React, { useEffect, useState } from 'react';
import { Room } from 'matrix-js-sdk';
import { useMatrix } from './Providers/MatrixProvider';
import { Membership } from '../modules/types';

const Chat: React.FC = () => {
  const { matrix } = useMatrix();

  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    setRooms(matrix.listOfOmniRooms(Membership.JOIN));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSetRoom = (roomId: string) => {
    matrix.setRoom(roomId);
  };
  const handleLeaveRoom = (roomId: string) => {
    matrix.leaveRoom(roomId);
  };
  const handleVerifyKey = () => {
    matrix.verifyWithKey('xxxx xxxx');
  };
  const handleVerifyPhrase = () => {
    matrix.verifyWithPhrase('xxxxxxx');
  };
  const handleRegister = () => {
    matrix.registration('xxx', 'yyyy');
  };
  const handleInit = () => {
    matrix.mstInitiate({
      salt: '123',
      callData: '0xdata',
      callHash: '0xhash',
      chainId: '0xchain',
      senderAddress: '5GmedEVixRJoE8TjMePLqz7DnnQG1d5517sXdiAvAF2t7EYW',
    });
  };
  const handleApprove = () => {
    matrix.mstApprove({
      salt: '123',
      callHash: '0xhash',
      chainId: '0xchain',
      senderAddress: '5GmedEVixRJoE8TjMePLqz7DnnQG1d5517sXdiAvAF2t7EYW',
    });
  };

  return (
    <div>
      <div>
        <span className="text-lg block">
          Verification status: {matrix.isVerified.toString()}
        </span>
        <span className="text-lg block">{`Session Key: ${matrix.sessionKey}`}</span>
      </div>
      <div className="flex">
        <button
          type="button"
          className="border p-1 mr-2 bg-red-400 text-white"
          onClick={handleRegister}
        >
          register
        </button>
        <button
          type="button"
          className="border p-1 mr-2 bg-green-200"
          onClick={handleVerifyKey}
        >
          verify with key
        </button>
        <button
          type="button"
          className="border p-1 mr-2 bg-green-200"
          onClick={handleVerifyPhrase}
        >
          verify with phrase
        </button>
        <button type="button" className="border p-1 mr-2" onClick={handleInit}>
          init
        </button>
        <button type="button" className="border p-1" onClick={handleApprove}>
          approve
        </button>
      </div>
      <ul>
        {rooms.map((room) => (
          <li key={room.roomId}>
            {room.name}
            <button
              type="button"
              className="border ml-1 p-1"
              onClick={() => handleSetRoom(room.roomId)}
            >
              set room
            </button>
            <button
              type="button"
              className="border ml-1 p-1"
              onClick={() => handleLeaveRoom(room.roomId)}
            >
              leave room
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Chat;
