import Olm from '@matrix-org/olm';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import olmWasmPath from '@matrix-org/olm/olm.wasm';
import * as sdk from 'matrix-js-sdk';
import { EventType, MatrixClient, MatrixEventEvent, Preset, Room, RoomMemberEvent, Visibility } from 'matrix-js-sdk';
import Dexie from 'dexie';
import WebStorageSessionStore from '../../common/utils/webstorage';
import { HexString } from '../../common/types';

const ROOM_CRYPTO_CONFIG = { algorithm: 'm.megolm.v1.aes-sha2' };
const BASE_URL = 'https://matrix.org';

const enum Membership {
  INVITE = 'invite',
  JOIN = 'join',
  LEAVE = 'leave',
}

const enum NovaMstEvents {
  INIT = 'io.novafoundation.omni.mst_initiated',
  APPROVE = 'io.novafoundation.omni.mst_approved',
  FINAL_APPROVE = 'io.novafoundation.omni.mst_executed',
  CANCEL = 'io.novafoundation.omni.mst_cancelled',
}

// type CreateClient = {
//   login: string;
//   password: string;
// };

type RoomCreation = {
  mstAccountAddress: string;
  threshold: number;
  signatories: {
    matrixAddress: string;
    networkAddress: string;
    isInviter: boolean;
  }[];
};

type Signatory = RoomCreation['signatories'];

type MstBaseParams = {
  chainId: HexString; // genesis hash of the network MST sent in
  callHash: HexString;
};

type MstInitParams = MstBaseParams & {
  callData: HexString;
  description: string;
};

type MstCancelParams = MstBaseParams & {
  description?: string;
};

type Subscriptions = {
  onInvite: () => void;
  onMst: () => void;
  onMessage: () => void;
};

interface SecureMessenger {
  // Common
  init: () => Promise<void | never>;
  login: (login: string, password: string) => Promise<void | never>;
  logout: () => Promise<void | never>;
  register(login: string, password: string, sessionId: string): Promise<void | never>;
  createRoom: (params: RoomCreation) => Promise<void | never>;
  joinRoom(roomId: string): Promise<void | never>;
  invite(roomId: string, signatoryId: string): Promise<void | never>;
  listOfInvites(): Room[];
  setRoom: (roomId: string) => void;
  sendMessage: (message: string) => void;
  setupSubscribers: (functions: Subscriptions) => void;

  // MST operations
  mstInitiate: (params: MstInitParams) => void;
  mstApprove: (params: MstBaseParams) => void;
  mstFinalApprove: (params: MstBaseParams) => void;
  mstCancel: (params: MstCancelParams) => void;
}

class Matrix implements SecureMessenger {
  private static instance: Matrix;

  private matrixClient: MatrixClient;
  private isEncryptionActive: boolean = false;
  private activeRoomId: string = '';
  private storage: Dexie;

  private onInvite: (roomId: string) => void;
  private onMst: () => void;
  private onMessage: (message: string) => void;

  constructor(storage: Dexie) {
    if (Matrix.instance) {
      return Matrix.instance;
    }
    Matrix.instance = this;
    this.storage = storage;
  }

  /**
   * Initialize Matrix protocol with encryption
   * @return {Promise}
   * @throws {Error}
   */
  async init(): Promise<void | never> {
    if (this.isEncryptionActive) {
      throw new Error('🔶 Matrix encryption has already been initialized 🔶');
    }

    try {
      await Olm.init({ locateFile: () => olmWasmPath });
      this.isEncryptionActive = true;
      console.info('=== 🟢 Olm started 🟢 ===');
    } catch (error) {
      throw this.createError('=== 🔴 Olm failed 🔴 ===', error);
    }
  }

  /**
   * Login user to Matrix
   * @param login login value
   * @param password password value
   * @return {Promise}
   * @throws {Error}
   */
  async login(login: string, password: string): Promise<void | never> {
    if (!this.isEncryptionActive) {
      throw new Error('🔶 Matrix encryption has not been initialized 🔶');
    }
    if (this.matrixClient?.isLoggedIn()) {
      throw new Error('🔶 Matrix client is already logged in 🔶');
    }

    try {
      await this.initClient(login, password);
      this.subscribeToEvents();
    } catch (error) {
      throw this.createError((error as Error).message, error);
    }
  }

  /**
   * Logout user from Matrix
   * @return {Promise}
   * @throws {Error}
   */
  async logout(): Promise<void | never> {
    this.checkClientLoggedIn();

    try {
      await this.matrixClient.logout();
    } catch (error) {
      throw this.createError('Logout failed', error);
    }
  }

  /**
   * Register user into Matrix
   * @param login login value
   * @param password password value
   * @param sessionId password value
   * @return {Promise}
   * @throws {Error}
   */
  async register(login: string, password: string, sessionId: string): Promise<void | never> {
    if (!this.isEncryptionActive) {
      throw new Error('🔶 Matrix encryption has not been initialized 🔶');
    }

    try {
      // TODO: placeholder
      await this.matrixClient.register(login, password, sessionId, { type: '123' });
    } catch (error) {
      throw this.createError('Login failed', error);
    }
  }

  /**
   * Create a room for new MST account
   * @param params room configuration
   * @return {Promise}
   * @throws {Error}
   */
  async createRoom(params: RoomCreation): Promise<void | never> {
    this.checkClientLoggedIn();

    try {
      const { room_id: roomId } = await this.matrixClient.createRoom({
        name: `OMNI MST | ${params.mstAccountAddress}`,
        visibility: Visibility.Private,
        preset: Preset.TrustedPrivateChat,
      });

      await this.initialStateEvents(roomId, params);
      await this.inviteSignatories(roomId, params.signatories);
      await this.verifyDevices(roomId);
    } catch (error) {
      throw this.createError((error as Error).message, error);
    }
  }

  private async initialStateEvents(roomId: string, params: RoomCreation): Promise<void> {
    await this.matrixClient.sendStateEvent(roomId, 'm.room.encryption', ROOM_CRYPTO_CONFIG);

    const omniExtras = {
      mst_account: {
        threshold: params.threshold,
        signatories: params.signatories.map((signatory) => signatory.networkAddress),
        address: params.mstAccountAddress,
      },
      invite: {
        inviter: params.signatories.find((signatory) => signatory.isInviter)?.networkAddress,
        signature: '0x123', // TODO: sign with Parity Signer
      },
    };

    const topicContent = {
      topic: `Room for communications for ${params.mstAccountAddress} MST account`,
      omni_extras: omniExtras,
    };

    await this.matrixClient.sendStateEvent(roomId, 'm.room.topic', topicContent);
  }

  private async inviteSignatories(roomId: string, signatories: Signatory): Promise<void> {
    const inviteRequests = signatories.reduce((acc, signatory) => {
      acc.push(this.matrixClient.invite(roomId, signatory.matrixAddress));

      return acc;
    }, [] as Promise<unknown>[]);

    await Promise.all(inviteRequests);
  }

  private async verifyDevices(roomId: string): Promise<void> {
    // // FIXME: not always returns the room!
    const room = this.matrixClient.getRoom(roomId);
    if (!room) {
      console.error(' === 🔴 Room not found');
      return;
    }

    const targetMembers = await room.getEncryptionTargetMembers();
    const members = targetMembers.map((member) => member.userId);

    const memberKeys = await this.matrixClient.downloadKeys(members);
    const verifyRequests = members.reduce((acc, userId) => {
      Object.keys(memberKeys[userId]).forEach((deviceId) => {
        acc.push(this.matrixClient.setDeviceVerified(userId, deviceId));
      });

      return acc;
    }, [] as Promise<void>[]);

    await Promise.all(verifyRequests);
    console.info(' === 🟢 Devices verified');
  }

  /**
   * Join an existing MST room
   * @param roomId room's identifier
   * @return {Promise}
   * @throws {Error}
   */
  async joinRoom(roomId: string): Promise<void | never> {
    this.checkClientLoggedIn();

    try {
      await this.matrixClient.joinRoom(roomId);
    } catch (error) {
      throw this.createError(`Failed to join room - ${roomId}`, error);
    }
  }

  /**
   * Invite signatory to an existing MST room
   * @param roomId room's identifier
   * @param signatoryId signatory's identifier
   * @return {Promise}
   * @throws {Error}
   */
  async invite(roomId: string, signatoryId: string): Promise<void | never> {
    this.checkClientLoggedIn();

    try {
      await this.matrixClient.invite(roomId, signatoryId);
    } catch (error) {
      throw this.createError(`Failed to invite - ${signatoryId} to room - ${roomId}`, error);
    }
  }

  /**
   * List of invites
   * @return {Array}
   */
  listOfInvites(): Room[] {
    this.checkClientLoggedIn();

    const rooms = this.matrixClient.getRooms();

    if (rooms.length === 0) return [];

    return rooms.filter((room) => room.getMyMembership() === Membership.INVITE);
  }

  /**
   * Set active room id
   * @param roomId room's identifier
   */
  setRoom(roomId: string): void {
    this.activeRoomId = roomId;
  }

  /**
   * Send message to active room
   * @param message sending message
   * @return {Promise}
   */
  async sendMessage(message: string): Promise<void> {
    this.checkClientLoggedIn();

    try {
      await this.matrixClient.sendTextMessage(this.activeRoomId, message);
    } catch (error) {
      console.error('Message not sent');
    }
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
  }

  /**
   * Setup subscription
   * @param onInvite room invite callback
   * @param onMst new mst callback
   * @param onMessage new message callback
   */
  setupSubscribers({ onInvite, onMst, onMessage }: Subscriptions): void {
    this.onInvite = onInvite;
    this.onMst = onMst;
    this.onMessage = onMessage;
  }

  /**
   * Send MST_INIT state event to the room
   * Initialize multi-sig transaction
   * @param params MST parameters
   * @return {Promise}
   * @throws {Error}
   */
  async mstInitiate(params: MstInitParams): Promise<void | never> {
    this.checkClientLoggedIn();
    this.checkInsideRoom();

    try {
      await this.matrixClient.sendStateEvent(this.activeRoomId, NovaMstEvents.INIT, params);
    } catch (error) {
      throw this.createError('MST_INIT failed', error);
    }
  }

  /**
   * Send MST_APPROVE state event to the room
   * Approve multi-sig transaction
   * @param params MST parameters
   * @return {Promise}
   * @throws {Error}
   */
  async mstApprove(params: MstBaseParams): Promise<void | never> {
    this.checkClientLoggedIn();
    this.checkInsideRoom();

    try {
      await this.matrixClient.sendStateEvent(this.activeRoomId, NovaMstEvents.APPROVE, params);
    } catch (error) {
      throw this.createError('MST_APPROVE failed', error);
    }
  }

  /**
   * Send MST_FINAL_APPROVE state event to the room
   * Final approve for multi-sig transaction
   * @param params MST parameters
   * @return {Promise}
   * @throws {Error}
   */
  async mstFinalApprove(params: MstBaseParams): Promise<void | never> {
    this.checkClientLoggedIn();
    this.checkInsideRoom();

    try {
      await this.matrixClient.sendStateEvent(this.activeRoomId, NovaMstEvents.FINAL_APPROVE, params);
    } catch (error) {
      throw this.createError('MST_FINAL_APPROVE failed', error);
    }
  }

  /**
   * Send MST_CANCEL state event to the room
   * Cancel multi-sig transaction
   * @param params MST parameters
   * @return {Promise}
   * @throws {Error}
   */
  async mstCancel(params: MstCancelParams): Promise<void | never> {
    this.checkClientLoggedIn();
    this.checkInsideRoom();

    try {
      await this.matrixClient.sendStateEvent(this.activeRoomId, NovaMstEvents.CANCEL, params);
    } catch (error) {
      throw this.createError('MST_CANCEL failed', error);
    }
  }

  private async initClient(login: string, password: string): Promise<void | never> {
    if (this.matrixClient) return;

    // check DB
    // this.storage.

    // else create new one
    const loginClient = sdk.createClient({ baseUrl: BASE_URL });
    const userLoginResult = await loginClient.loginWithPassword(login, password);

    this.matrixClient = sdk.createClient({
      baseUrl: BASE_URL,
      userId: userLoginResult.user_id,
      accessToken: userLoginResult.access_token,
      deviceId: userLoginResult.device_id,
      sessionStore: new WebStorageSessionStore(window.localStorage),
      cryptoStore: new sdk.MemoryCryptoStore(),
    });

    // save to db
  }

  private subscribeToEvents(): void {
    this.handleInvite();
    this.handleMatrixEvents();

    // matrixClient.sendTextMessage = async (message, roomId: string) => {
    //   return matrixClient.sendMessage(roomId, {
    //     body: message,
    //     msgtype: 'm.text',
    //   });
    // };
  }

  private handleInvite(): void {
    this.matrixClient.on(RoomMemberEvent.Membership, async (_, { roomId, userId, membership }) => {
      const isValidUser = userId === this.matrixClient.getUserId() && membership === Membership.INVITE;
      if (isValidUser) {
        await this.matrixClient.joinRoom(roomId);
        this.onInvite(roomId);
      }
    });
  }

  private handleMatrixEvents(): void {
    this.matrixClient.on(MatrixEventEvent.Decrypted, (event) => {
      // TODO: handle other events
      switch (event.getType()) {
        case EventType.RoomMessage:
          this.onMessage(event.getContent().body);
          break;
        default:
          console.log('=== Decrypted an event of type', event.getType());
          console.dir('=== Event - ', event);
          break;
      }
    });
  }

  private createError(message: string, error: unknown): Error {
    const typedError = error instanceof Error ? error : new Error('Error: ', { cause: error as Error });

    return new Error(`🔶 Matrix: ${message} 🔶`, { cause: typedError });
  }

  private checkClientLoggedIn(message?: string): void | never {
    if (!this.matrixClient?.isLoggedIn()) {
      const throwMsg = message ? `🔶 ${message} 🔶` : '🔶 Matrix client is not logged in 🔶';
      throw new Error(throwMsg);
    }
  }

  private checkInsideRoom(message?: string): void | never {
    if (!this.activeRoomId) {
      const throwMsg = message ? `🔶 ${message} 🔶` : '🔶 Matrix client is outside of room 🔶';
      throw new Error(throwMsg);
    }
  }
}

export default Matrix;
