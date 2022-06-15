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
      <button type="button" className="border p-1 mr-2" onClick={handleInit}>
        init
      </button>
      <button type="button" className="border p-1" onClick={handleApprove}>
        approve
      </button>
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
