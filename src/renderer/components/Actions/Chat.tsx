import React, { ChangeEvent, FormEvent, useState } from 'react';
import * as sdk from 'matrix-js-sdk';
import InputText from '../../ui/Input';
import Button from '../../ui/Button';
import WebStorageSessionStore from '../../../common/utils/webstorage';

const ROOM_CRYPTO_CONFIG = { algorithm: 'm.megolm.v1.aes-sha2' };
const BASE_URL = 'https://matrix.org';

function setupClientHandlers(client: sdk.MatrixClient): void {
  // Automatic join room on invite
  client.on(sdk.RoomMemberEvent.Membership, async (_, member) => {
    if (member.userId === client.getUserId() && member.membership === 'invite') {
      await client.joinRoom(member.roomId);
    }
  });

  // Get room message (or another event)
  client.on(sdk.MatrixEventEvent.Decrypted, (event: any) => {
    if (event.getType() === 'm.room.message') {
      console.log('Got encrypted message: ', event.getContent().body);
    } else {
      console.log('decrypted an event of type', event.getType());
      console.log(event);
    }
  });

  // matrixClient.sendTextMessage = async (message, roomId: string) => {
  //   return matrixClient.sendMessage(roomId, {
  //     body: message,
  //     msgtype: 'm.text',
  //   });
  // };
}

async function createEncryptedRoom(
  client: sdk.MatrixClient,
  usersToInvite: string[],
): Promise<{ created: boolean; roomId: string }> {
  const { room_id: roomId } = await client.createRoom({
    name: 'My test room',
    visibility: sdk.Visibility.Private,
    invite: usersToInvite,
  });

  // await client.joinRoom(roomId);
  await client.sendStateEvent(roomId, 'm.room.encryption', ROOM_CRYPTO_CONFIG);
  // await client.setRoomEncryption(roomId, ROOM_CRYPTO_CONFIG);
  // console.log('=== 🏁 setRoomEncryption 🏁 ===');
  //
  // // Marking all devices as verified
  const room = client.getRoom(roomId);
  if (!room) {
    console.warn(' === 🔴 Room not found');
    return { created: false, roomId };
  }

  const targetMembers = await room.getEncryptionTargetMembers();
  const members = targetMembers.map((x) => x.userId);

  const memberKeys = await client.downloadKeys(members);
  const verifyRequests = members.reduce((acc, userId) => {
    Object.keys(memberKeys[userId]).forEach((deviceId) => {
      acc.push(client.setDeviceVerified(userId, deviceId));
    });

    return acc;
  }, [] as Promise<void>[]);

  await Promise.all(verifyRequests);
  console.info(' === 🟢 Devices verified');

  return { created: true, roomId };
}

async function createClient(login: string, password: string): Promise<sdk.MatrixClient> {
  const loginClient = sdk.createClient({
    baseUrl: BASE_URL,
  });
  const userLoginResult = await loginClient.loginWithPassword(login, password);

  const client = sdk.createClient({
    baseUrl: BASE_URL,
    userId: userLoginResult.user_id,
    accessToken: userLoginResult.access_token,
    deviceId: userLoginResult.device_id,
    sessionStore: new WebStorageSessionStore(window.localStorage),
    cryptoStore: new sdk.MemoryCryptoStore(),
  });

  setupClientHandlers(client);

  await client.initCrypto();
  await client.startClient();

  return client;
}

const Chat: React.FC = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [activeRoomId, setActiveRoomId] = useState('');
  const [authInProgress, setAuthInProgress] = useState(false);
  const [client, setClient] = useState<sdk.MatrixClient>({} as sdk.MatrixClient);

  const onLoginClick = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthInProgress(true);

    try {
      // const client = await createClient(login, password);
      const newClient = await createClient('tuul_wq', '3a5p6qq1w');
      setClient(newClient);
    } catch (error) {
      console.warn('Failed due to - ', error);
    } finally {
      setAuthInProgress(false);
    }
  };

  const onCreateRoom = async () => {
    try {
      const { created, roomId } = await createEncryptedRoom(client, []);
      setActiveRoomId(roomId);
      console.info(`🟢 Room ${roomId} created - `, created);
    } catch (error) {
      console.warn(error);
    }
  };

  const onMessageSend = () => {
    client.sendTextMessage(activeRoomId, 'Hello');
    // client.sendEvent(activeRoomId, 'm.room.message', {
    //   body: 'Hello',
    //   msgtype: 'm.text',
    // });

    // client.on('sync', async (state: any) => {
    //   if (state === 'PREPARED') {
    //     console.log('prepared');
    //   } else {
    //     console.log(state);
    //   }
    // });
  };

  const onChangeLogin = (event: ChangeEvent<HTMLInputElement>) => {
    setLogin(event.target.value);
  };

  const onChangePassword = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const onChangeMessage = (event: ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  return (
    <form onSubmit={onLoginClick}>
      <h2 className="font-light text-xl p-4">Chat</h2>
      <div className="p-2">
        <InputText className="w-full" label="Login" placeholder="Login" value={login} onChange={onChangeLogin} />
      </div>
      <div className="p-2">
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
        <InputText
          className="w-full"
          label="Message"
          placeholder="Message"
          type="text"
          value={message}
          onChange={onChangeMessage}
        />
      </div>
      <div className="p-2">
        <Button size="lg" submit disabled={authInProgress}>
          Login
        </Button>
        <Button className="mt-2" size="lg" disabled={authInProgress} onClick={onCreateRoom}>
          Create room
        </Button>
        <Button className="mt-2" size="lg" disabled={authInProgress} onClick={onMessageSend}>
          Send message
        </Button>
      </div>
    </form>
  );
};

export default Chat;
