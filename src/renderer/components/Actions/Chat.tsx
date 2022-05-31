import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { Room } from 'matrix-js-sdk';
import InputText from '../../ui/Input';
import Button from '../../ui/Button';
import { useMatrix } from '../Providers/MatrixProvider';
import { Membership } from '../../modules/types';

const Chat: React.FC = () => {
  const { matrix } = useMatrix();

  const [inviteValue, setInviteValue] = useState('');
  const [roomName, setRoomName] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [roomList, setRoomList] = useState<Room[]>([]);

  useEffect(() => {
    if (matrix.isLoggedIn) {
      setRoomList(matrix.listOfOmniRooms(Membership.JOIN));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onLoginClick = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await matrix.loginWithCreds(login, password);
    } catch (e) {
      console.log(e);
    }
  };
  const onCreateRoom = () => {
    matrix.createRoom(
      {
        mstAccountAddress: roomName,
        inviterPublicKey: '0x24dsfb',
        threshold: 2,
        signatories: [
          {
            isInviter: true,
            matrixAddress: matrix.userId,
            accountId: '0x8acac2',
          },
          {
            isInviter: false,
            matrixAddress: inviteValue,
            accountId: '0x2340dfa',
          },
          // {
          //   isInviter: false,
          //   matrixAddress: '@asmadek:matrix.org',
          //   networkAddress: '0xabc24',
          // },
        ],
      },
      (value: string) => Promise.resolve(`SIGNATURE ${value}`),
    );
  };
  const onChangeLogin = (event: ChangeEvent<HTMLInputElement>) => {
    setLogin(event.target.value);
  };
  const onChangePassword = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };
  // const onInvite = () => {
  //   matrix.invite('123', 'asd');
  // };

  const onSetRoom = (roomId: string) => async () => {
    matrix.setRoom(roomId);
    const messages = await matrix.timelineEvents();
    console.log(messages);
  };

  const onMstInit = () => {
    matrix.mstInitiate({
      callData: '0x12',
      callHash:
        '0x584b7834414111ce6eb8aa15e441b28db3c8bc9a9e36fcb42e8a28917dc1e05e',
      accountId: '5GmedEVixRJoE8TjMePLqz7DnnQG1d5517sXdiAvAF2t7EYW',
      chainId: '0xdsfsf',
      description: 'maaan',
    });
  };

  const onMstApprove = () => {
    matrix.mstApprove({
      callHash:
        '0x584b7834414111ce6eb8aa15e441b28db3c8bc9a9e36fcb42e8a28917dc1e05e',
      accountId: '5GmedEVixRJoE8TjMePLqz7DnnQG1d5517sXdiAvAF2t7EYW',
      chainId: '0xdsfsf',
    });
  };

  const onMstFinal = () => {
    matrix.mstFinalApprove({
      chainId: '0xdfd',
      callHash:
        '0x584b7834414111ce6eb8aa15e441b28db3c8bc9a9e36fcb42e8a28917dc1e05e',
      accountId: '5GmedEVixRJoE8TjMePLqz7DnnQG1d5517sXdiAvAF2t7EYW',
    });
  };

  const onMstCancel = () => {
    matrix.mstCancel({
      callHash:
        '0x584b7834414111ce6eb8aa15e441b28db3c8bc9a9e36fcb42e8a28917dc1e05e',
      accountId: '5GmedEVixRJoE8TjMePLqz7DnnQG1d5517sXdiAvAF2t7EYW',
      chainId: '0xdsfsf',
      description: 'CANCEL',
    });
  };

  // const onSendText = () => {
  //   matrix.sendMessage('TEST 123');
  // };

  return (
    <>
      <form onSubmit={onLoginClick}>
        <h2 className="font-light text-xl p-4">Chat</h2>
        <div className="p-2 flex gap-3">
          <InputText
            className="w-full"
            label="Login"
            placeholder="Login"
            disabled
            value={login}
            onChange={onChangeLogin}
          />

          <InputText
            className="w-full"
            label="Password"
            placeholder="Password"
            disabled
            type="password"
            value={password}
            onChange={onChangePassword}
          />
        </div>

        <div className="p-2">
          <Button type="submit" disabled>
            Login
          </Button>
          <div className="flex gap-4">
            <Button
              className="mt-2"
              disabled={!inviteValue || !roomName}
              onClick={onCreateRoom}
            >
              Create room
            </Button>
            <input
              className="border-b-black border-2"
              type="text"
              placeholder="Room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
            <input
              className="border-b-black border-2"
              type="text"
              placeholder="Matrix ID to invite"
              value={inviteValue}
              onChange={(e) => setInviteValue(e.target.value)}
            />
          </div>
        </div>
      </form>

      <div className="p-2 flex gap-2">
        {/* <button */}
        {/*   className="border-2 border-b-blue-700" */}
        {/*   type="button" */}
        {/*   onClick={onInvite} */}
        {/* > */}
        {/*   Invite */}
        {/* </button> */}
        <button
          className="border-2 border-b-blue-700"
          type="button"
          onClick={onMstInit}
        >
          MST init
        </button>
        <button
          className="border-2 border-b-blue-700"
          type="button"
          onClick={onMstApprove}
        >
          MST approve
        </button>
        <button
          className="border-2 border-b-blue-700"
          type="button"
          onClick={onMstFinal}
        >
          MST final approve
        </button>
        <button
          className="border-2 border-b-blue-700"
          type="button"
          onClick={onMstCancel}
        >
          MST cancel
        </button>
        {/* <button */}
        {/*   className="border-2 border-b-blue-700" */}
        {/*   type="button" */}
        {/*   onClick={onSendText} */}
        {/* > */}
        {/*   Send text */}
        {/* </button> */}
      </div>

      <h2>Rooms:</h2>
      <ul>
        {roomList.map((room) => (
          <li key={room.roomId} className="flex gap-3">
            <span>{room.name}</span>
            <button
              className="border-2 border-b-blue-700"
              type="button"
              onClick={onSetRoom(room.roomId)}
            >
              Set room
            </button>
          </li>
        ))}
      </ul>
    </>
  );
};

export default Chat;
