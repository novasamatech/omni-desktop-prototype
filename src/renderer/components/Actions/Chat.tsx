/* eslint-disable no-await-in-loop */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import React, { ChangeEvent, useState } from 'react';
import * as sdk from 'matrix-js-sdk';
import InputText from '../../ui/Input';
import Button from '../../ui/Button';
import WebStorageSessionStore from '../../../common/utils/webstorage';

enum Visibility {
  Public = 'public',
  Private = 'private',
}

const ROOM_CRYPTO_CONFIG = { algorithm: 'm.megolm.v1.aes-sha2' };

const Chat: React.FC = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');

  const onLoginClick = () => {
    const extendMatrixClient = (matrixClient: sdk.MatrixClient) => {
      // automatic join
      matrixClient.on(sdk.RoomMemberEvent.Membership, async (_, member) => {
        if (
          member.membership === 'invite' &&
          member.userId === matrixClient.getUserId()
        ) {
          await matrixClient.joinRoom(member.roomId);
          // setting up of room encryption seems to be triggered automatically
          // but if we don't wait for it the first messages we send are unencrypted
          await matrixClient.setRoomEncryption(
            member.roomId,
            ROOM_CRYPTO_CONFIG
          );
        }
      });

      matrixClient.on(sdk.MatrixEventEvent.Decrypted, (event: any) => {
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
    };

    const createEncryptedRoom = async (
      matrixClient: sdk.MatrixClient,
      usersToInvite: string[]
    ) => {
      const { room_id: roomId } = await matrixClient.createRoom({
        visibility: Visibility.Public,
        invite: usersToInvite,
      });

      console.log(roomId);

      // matrixClient.setRoomEncryption() only updates local state
      // but does not send anything to the server
      // (see https://github.com/matrix-org/matrix-js-sdk/issues/905)
      // so we do it ourselves with 'sendStateEvent'
      await matrixClient.sendStateEvent(
        roomId,
        'm.room.encryption',
        ROOM_CRYPTO_CONFIG
      );
      await matrixClient.setRoomEncryption(roomId, ROOM_CRYPTO_CONFIG);

      // Marking all devices as verified
      const room = matrixClient.getRoom(roomId);
      if (room) {
        const members = (await room.getEncryptionTargetMembers()).map(
          (x) => x.userId
        );
        const memberkeys = await matrixClient.downloadKeys(members);
        for (const userId in memberkeys) {
          for (const deviceId in memberkeys[userId]) {
            await matrixClient.setDeviceVerified(userId, deviceId);
          }
        }

        return roomId;
      }

      return roomId;
    };

    const startClient = async () => {
      const loginClient = sdk.createClient({
        baseUrl: 'https://matrix.org',
      });
      const userLoginResult = await loginClient.loginWithPassword(
        login,
        password
      );

      const client = sdk.createClient({
        baseUrl: 'https://matrix.org',
        userId: userLoginResult.user_id,
        accessToken: userLoginResult.access_token,
        deviceId: userLoginResult.device_id,
        sessionStore: new WebStorageSessionStore(window.localStorage),
        cryptoStore: new sdk.MemoryCryptoStore(),
      });

      extendMatrixClient(client);
      console.log(1);

      await client.initCrypto();
      await window.Olm.init();
      console.log(2);
      await client.startClient({ initialSyncLimit: 10 });
      console.log(3);
      const roomId = await createEncryptedRoom(client, []);

      if (roomId) {
        client.sendTextMessage(roomId, 'Hello');
        client.sendEvent(roomId, 'm.room.message', {
          body: 'Hello',
          msgtype: 'm.text',
        });
      }

      // client.on('sync', async (state: any) => {
      //   if (state === 'PREPARED') {
      //     console.log('prepared');
      //   } else {
      //     console.log(state);
      //   }
      // });
    };

    startClient();
  };

  const onChangeLogin = (event: ChangeEvent<HTMLInputElement>) => {
    setLogin(event.target.value);
  };

  const onChangePassword = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  return (
    <>
      <h2 className="font-light text-xl p-4">Chat</h2>
      <div className="p-2">
        <InputText
          className="w-full"
          label="Login"
          placeholder="Login"
          value={login}
          onChange={onChangeLogin}
        />
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
        <Button fat onClick={onLoginClick}>
          Login
        </Button>
      </div>
    </>
  );
};

export default Chat;
