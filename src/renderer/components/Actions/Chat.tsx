import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { Room } from 'matrix-js-sdk';
import InputText from '../../ui/Input';
import Button from '../../ui/Button';
import { useMatrix } from '../Providers/MatrixProvider';
import { Membership } from '../../modules/types';

const Chat: React.FC = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [roomList, setRoomList] = useState<Room[]>([]);

  const { matrix } = useMatrix();

  // useEffect(() => {
  //   if (matrix.isLoggedIn) {
  //     matrix.setupSubscribers({
  //       onSyncProgress: () => console.log('=== 🟢 progess'),
  //       onSyncEnd: () => console.log('=== 🟢 end'),
  //       onMessage: () => console.log('=== 🟢 message'),
  //       onInvite: () => console.log('=== 🟢 invite'),
  //       onMstEvent: (value) =>
  //         console.log(`=== 🟢 OMNI_MST_EVENTS.INIT ${value.toString()}`),
  //     });
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [matrix?.isLoggedIn]);

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
        mstAccountAddress: '5Gsad213SADBGFDG231',
        inviterPublicKey: '0x24dsfb',
        threshold: 2,
        signatories: [
          {
            isInviter: true,
            matrixAddress: '@tuul_wq:matrix.org',
            accountId: '0x8acac2',
          },
          {
            isInviter: false,
            matrixAddress: '@pamelo123:matrix.org',
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
  const onInvite = () => {
    matrix.invite('123', 'asd');
  };

  const onSetRoom = (roomId: string) => async () => {
    matrix.setRoom(roomId);
    const messages = await matrix.timelineEvents();
    console.log(messages);
  };

  const onMstInit = () => {
    matrix.mstInitiate({
      callData: '0x12',
      callHash: '0x233',
      chainId: '0xdsfsf',
      description: 'maaan',
    });
  };

  const onMstApprove = () => {
    matrix.mstApprove({
      callHash: '0x233',
      chainId: '0xdsfsf',
    });
  };

  const onMstFinal = () => {
    matrix.mstFinalApprove({
      chainId: '0xdfd',
      callHash: '0x21dsf',
    });
  };

  const onMstCancel = () => {
    matrix.mstCancel({
      callHash: '0x233',
      chainId: '0xdsfsf',
      description: 'CANCEL',
    });
  };

  const onSendText = () => {
    matrix.sendMessage('TEST 123');
  };

  return (
    <>
      <form onSubmit={onLoginClick}>
        <h2 className="font-light text-xl p-4">Chat</h2>
        <div className="p-2 flex gap-3">
          <InputText
            className="w-full"
            label="Login"
            placeholder="Login"
            value={login}
            onChange={onChangeLogin}
          />

          <InputText
            className="w-full"
            label="Password"
            placeholder="Password"
            type="password"
            value={password}
            onChange={onChangePassword}
          />
        </div>

        <div className="p-2">
          <Button type="submit">Login</Button>
          <Button className="mt-2" onClick={onCreateRoom}>
            Create room
          </Button>
        </div>
      </form>

      <div className="p-2 flex gap-2">
        <button
          className="border-2 border-b-blue-700"
          type="button"
          onClick={onInvite}
        >
          Invite
        </button>
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
        <button
          className="border-2 border-b-blue-700"
          type="button"
          onClick={onSendText}
        >
          Send text
        </button>
      </div>

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
