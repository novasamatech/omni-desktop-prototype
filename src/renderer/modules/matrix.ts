/* eslint-disable no-console */
import Olm from '@matrix-org/olm';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import olmWasmPath from '@matrix-org/olm/olm.wasm';
import {
  ClientEvent,
  createClient,
  Direction,
  EventType,
  IndexedDBCryptoStore,
  MatrixClient,
  MatrixEvent,
  MatrixEventEvent,
  MemoryCryptoStore,
  Preset,
  Room,
  RoomEvent,
  RoomMemberEvent,
  Visibility,
} from 'matrix-js-sdk';
import { SyncState } from 'matrix-js-sdk/lib/sync';
import { uniq } from 'lodash';
import { EventStatus } from 'matrix-js-sdk/lib/models/event-status';
import { OmniDexie } from '../db/db';
import { BooleanValue } from '../db/types';
import {
  Callbacks,
  InvitePayload,
  ISecureMessenger,
  Membership,
  MstParams,
  MSTPayload,
  OmniExtras,
  OmniMstEvents,
  RoomCreation,
  Signatory,
} from './types';
import { BASE_MATRIX_URL, ROOM_CRYPTO_CONFIG } from './constants';

class Matrix implements ISecureMessenger {
  private static instance: Matrix;

  private matrixClient!: MatrixClient;
  private storage!: OmniDexie;

  private activeRoomId: string = '';
  private subscribeHandlers?: Callbacks;
  private isClientSynced: boolean = false;
  private isEncryptionActive: boolean = false;

  constructor(storage: OmniDexie) {
    if (Matrix.instance) {
      return Matrix.instance;
    }
    Matrix.instance = this;

    this.createDefaultClient();
    this.storage = storage;
  }

  // =====================================================
  // ================= Public methods ====================
  // =====================================================

  /**
   * Initialize Matrix protocol with encryption
   * @return {Promise}
   * @throws {Error}
   */
  async init(): Promise<void | never> {
    if (this.isEncryptionActive) {
      throw this.createError('Encryption has already been initialized');
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
  async loginWithCreds(login: string, password: string): Promise<void | never> {
    if (!this.isEncryptionActive) {
      throw this.createError('Encryption has not been initialized');
    }
    if (this.matrixClient.isLoggedIn()) {
      throw this.createError('Client is already logged in');
    }

    try {
      await this.initClientWithCreds(login, password);
      this.subscribeToEvents();
      await this.matrixClient.initCrypto();
      await this.matrixClient.startClient();
      this.matrixClient.setGlobalErrorOnUnknownDevices(false);
    } catch (error) {
      throw this.createError((error as Error).message, error);
    }
  }

  /**
   * Login user to Matrix with cached credentials
   * @return {Promise}
   * @throws {Error}
   */
  async loginFromCache(): Promise<void | never> {
    if (!this.isEncryptionActive) {
      throw this.createError('Encryption has not been initialized');
    }
    if (this.matrixClient.isLoggedIn()) {
      throw this.createError('Client is already logged in');
    }

    try {
      await this.initClientFromCache();
      this.subscribeToEvents();
      await this.matrixClient.initCrypto();
      await this.matrixClient.startClient();
      this.matrixClient.setGlobalErrorOnUnknownDevices(false);
    } catch (error) {
      throw this.createError((error as Error).message, error);
    }
  }

  /**
   * Get matrix userId
   * @return {String}
   */
  get userId(): string {
    return this.matrixClient.getUserId() || '';
  }

  /**
   * Is Matrix user logged in
   * @return {Boolean}
   */
  get isLoggedIn(): boolean {
    return Boolean(this.matrixClient.isLoggedIn());
  }

  /**
   * Is Matrix client synced
   * @return {Boolean}
   */
  get isSynced(): boolean {
    return this.isLoggedIn && this.isClientSynced;
  }

  /**
   * Stop the client and remove handlers
   * @return {Promise}
   */
  stopClient(): void {
    this.matrixClient.stopClient();
    this.clearSubscribers();
    this.createDefaultClient();
  }

  /**
   * Logout user from Matrix,
   * terminate client,
   * stop synchronization polling
   * @return {Promise}
   * @throws {Error}
   */
  async logout(): Promise<void | never> {
    this.checkClientLoggedIn();

    try {
      this.clearSubscribers();
      this.matrixClient.stopClient();
      await this.matrixClient.logout();
      // await this.matrixClient.clearStores();
      await this.storage.mxCredentials.where({ userId: this.userId }).delete();
      this.createDefaultClient();
    } catch (error) {
      throw this.createError('Logout failed', error);
    }
  }

  /**
   * Create a room for new MST account
   * @param params room configuration
   * @param signWithColdWallet create signature with cold wallet
   * @return {Promise}
   * @throws {Error}
   */
  async createRoom(
    params: RoomCreation,
    signWithColdWallet: (value: string) => Promise<string>,
  ): Promise<void | never> {
    this.checkClientLoggedIn();

    try {
      const { room_id: roomId } = await this.matrixClient.createRoom({
        name: `OMNI MST | ${params.mstAccountAddress}`,
        visibility: Visibility.Private,
        preset: Preset.TrustedPrivateChat,
      });

      const signature = await signWithColdWallet(
        `${params.mstAccountAddress}${roomId}`,
      );
      await this.initialStateEvents(roomId, params, signature);
      await this.inviteSignatories(roomId, params.signatories);

      const members = params.signatories.map(
        (signatory) => signatory.matrixAddress,
      );
      await this.verifyDevices(members);
    } catch (error) {
      throw this.createError((error as Error).message, error);
    }
  }

  /**
   * Join existing MST room, skips if already joined
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
   * Invite signatory to existing MST room
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
      throw this.createError(
        `Failed to invite - ${signatoryId} to room - ${roomId}`,
        error,
      );
    }
  }

  /**
   * List of available OMNI rooms
   * @param type which rooms to get Invite/Join
   * @return {Array}
   */
  listOfOmniRooms(type: Membership.INVITE | Membership.JOIN): Room[] {
    this.checkClientLoggedIn();

    return this.matrixClient
      .getRooms()
      .filter(
        (room) => this.isOmniRoom(room.name) && room.getMyMembership() === type,
      );
  }

  /**
   * Set active room id
   * @param roomId room's identifier
   */
  setRoom(roomId: string): void {
    this.activeRoomId = roomId;
  }

  /**
   * Get live timeline events for all rooms
   * @return {Array}
   * @throws {Error}
   */
  async timelineEvents(): Promise<MSTPayload[] | never> {
    let rooms;
    try {
      rooms = (await this.matrixClient.getJoinedRooms()).joined_rooms;
    } catch (error) {
      throw this.createError('Failed to load joined rooms', error);
    }

    const omniEvents = Object.values(OmniMstEvents);
    const omniTimeline = rooms.reduce((acc, roomId) => {
      const room = this.matrixClient.getRoom(roomId);

      if (!room || !this.isOmniRoom(room.name)) return acc;

      const timelineEvents = room
        .getLiveTimeline()
        .getEvents()
        .filter((event) =>
          omniEvents.includes(event.getType() as OmniMstEvents),
        );

      if (timelineEvents.length > 0) {
        acc.push(...timelineEvents);
      }

      return acc;
    }, [] as MatrixEvent[]);

    return omniTimeline.map((event) =>
      this.createEventPayload<MSTPayload>(event),
    );
  }

  /**
   * Send message to active room
   * @param message sending message
   * @return {Promise}
   */
  async sendMessage(message: string): Promise<void> {
    this.checkClientLoggedIn();
    this.checkInsideRoom();

    try {
      await this.matrixClient.sendTextMessage(this.activeRoomId, message);
    } catch (error) {
      throw this.createError('Message not sent', error);
    }
  }

  /**
   * Setup subscription
   * @param handlers aggregated callback handlers
   */
  setupSubscribers(handlers: Callbacks): void {
    this.subscribeHandlers = handlers;
  }

  /**
   * Clear subscription
   */
  clearSubscribers(): void {
    this.matrixClient.removeAllListeners();
    this.subscribeHandlers = undefined as unknown as Callbacks;
  }

  /**
   * Check does User already exist
   * @param userId matrix identifier
   * @return {Promise}
   * @throws {Error}
   */
  async checkUserExists(userId: string): Promise<boolean | never> {
    if (!this.matrixClient) {
      throw this.createError('Client is not active');
    }

    const userName = userId.match(/^@([a-z\d=_\-./]+):/);
    if (!userName) {
      throw new Error('User ID can only contain characters a-z, 0-9, or =_-./');
    }

    try {
      return await this.matrixClient.isUsernameAvailable(userName?.[1]);
    } catch (error) {
      throw this.createError((error as Error).message, error);
    }
  }

  /**
   * Send MST_INIT state event to the room
   * Initialize multi-sig transaction
   * @param params MST parameters
   * @return {Promise}
   * @throws {Error}
   */
  async mstInitiate(params: MstParams): Promise<void | never> {
    this.checkClientLoggedIn();
    this.checkInsideRoom();

    try {
      await this.matrixClient.sendEvent(
        this.activeRoomId,
        OmniMstEvents.INIT,
        params,
      );
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
  async mstApprove(params: MstParams): Promise<void | never> {
    this.checkClientLoggedIn();
    this.checkInsideRoom();

    try {
      await this.matrixClient.sendEvent(
        this.activeRoomId,
        OmniMstEvents.APPROVE,
        params,
      );
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
  async mstFinalApprove(params: MstParams): Promise<void | never> {
    this.checkClientLoggedIn();
    this.checkInsideRoom();

    try {
      await this.matrixClient.sendEvent(
        this.activeRoomId,
        OmniMstEvents.FINAL_APPROVE,
        params,
      );
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
  async mstCancel(params: MstParams): Promise<void | never> {
    this.checkClientLoggedIn();
    this.checkInsideRoom();

    try {
      await this.matrixClient.sendEvent(
        this.activeRoomId,
        OmniMstEvents.CANCEL,
        params,
      );
    } catch (error) {
      throw this.createError('MST_CANCEL failed', error);
    }
  }

  // =====================================================
  // ================= Private methods ===================
  // =====================================================

  private async initialStateEvents(
    roomId: string,
    params: RoomCreation,
    signature: string,
  ): Promise<void> {
    await this.matrixClient.sendStateEvent(
      roomId,
      'm.room.encryption',
      ROOM_CRYPTO_CONFIG,
    );

    const omniExtras = {
      mst_account: {
        threshold: params.threshold,
        signatories: params.signatories.map((signatory) => signatory.accountId),
        address: params.mstAccountAddress,
      },
      invite: {
        signature,
        public_key: params.inviterPublicKey,
      },
    };

    const topicContent = {
      topic: `Room for communications for ${params.mstAccountAddress} MST account`,
      omni_extras: omniExtras,
    };

    await this.matrixClient.sendStateEvent(
      roomId,
      'm.room.topic',
      topicContent,
    );
  }

  private async inviteSignatories(
    roomId: string,
    signatories: Signatory[],
  ): Promise<void> {
    const inviterAddress = signatories.find((s) => s.isInviter)?.matrixAddress;

    const noDuplicates = uniq(
      signatories
        .filter((s) => !s.isInviter && s.matrixAddress !== inviterAddress)
        .map((s) => s.matrixAddress),
    );

    const inviteRequests = noDuplicates.reduce((acc, matrixAddress) => {
      acc.push(this.matrixClient.invite(roomId, matrixAddress));

      return acc;
    }, [] as Promise<unknown>[]);

    await Promise.all(inviteRequests);
  }

  private async verifyDevices(members: string[]): Promise<void | never> {
    const memberKeys = await this.matrixClient.downloadKeys(members);

    const verifyRequests = members.reduce((acc, userId) => {
      Object.keys(memberKeys[userId]).forEach((deviceId) => {
        acc.push(this.matrixClient.setDeviceVerified(userId, deviceId));
      });
      return acc;
    }, [] as Promise<void>[]);

    await Promise.all(verifyRequests);
    console.info('=== 🟢 Devices verified');
  }

  private async initClientWithCreds(
    login: string,
    password: string,
  ): Promise<void | never> {
    const userLoginResult = await this.matrixClient.loginWithPassword(
      login,
      password,
    );

    this.matrixClient = createClient({
      baseUrl: BASE_MATRIX_URL,
      userId: userLoginResult.user_id,
      accessToken: userLoginResult.access_token,
      deviceId: userLoginResult.device_id,
      sessionStore: new MemoryCryptoStore(),
      cryptoStore: new IndexedDBCryptoStore(window.indexedDB, 'matrix'),
    });

    await this.storage.mxCredentials.add({
      userId: userLoginResult.user_id,
      accessToken: userLoginResult.access_token,
      deviceId: userLoginResult.device_id,
      isLoggedIn: BooleanValue.TRUE,
    });
  }

  private async initClientFromCache(): Promise<void | never> {
    const credentials = await this.storage.mxCredentials.get({
      isLoggedIn: BooleanValue.TRUE,
    });

    if (!credentials) {
      throw new Error('No credentials in DataBase');
    }

    this.matrixClient = createClient({
      baseUrl: BASE_MATRIX_URL,
      userId: credentials.userId,
      accessToken: credentials.accessToken,
      deviceId: credentials.deviceId,
      sessionStore: new MemoryCryptoStore(),
      cryptoStore: new IndexedDBCryptoStore(window.indexedDB, 'matrix'),
    });
  }

  private subscribeToEvents(): void {
    this.handleSyncEvent();
    this.handleInviteEvent();
    this.handleMatrixEvents();
    this.handleOmniEvents();
  }

  private handleSyncEvent() {
    this.matrixClient.on(ClientEvent.Sync, (state) => {
      if (state === SyncState.Syncing) {
        this.subscribeHandlers?.onSyncProgress();
      }
      if (state === SyncState.Prepared) {
        console.info('=== 🔶 Sync prepared');
        this.isClientSynced = true;
        this.subscribeHandlers?.onSyncEnd();
      }
    });
  }

  private handleInviteEvent(): void {
    this.matrixClient.on(RoomMemberEvent.Membership, async (event, member) => {
      if (event.getSender() === this.userId) return;

      const roomId = event.getRoomId();
      const isValidUser =
        member.userId === this.userId &&
        member.membership === Membership.INVITE;

      if (!isValidUser || !roomId) return;

      const roomSummary = await this.matrixClient.getRoomSummary(roomId);
      if (!this.isOmniRoom(roomSummary.name)) return;

      const room = this.matrixClient.getRoom(roomId);
      if (!room) return;

      this.subscribeHandlers?.onInvite(
        this.createEventPayload<InvitePayload>(event, {
          content: this.getOmniTopic(room),
          roomName: room.name,
        }),
      );
    });
  }

  private handleMatrixEvents(): void {
    this.matrixClient.on(MatrixEventEvent.Decrypted, async (event) => {
      if (event.getType() !== EventType.RoomMessage) return;

      const roomId = event.getRoomId();
      if (!roomId) return;

      const room = this.matrixClient.getRoom(roomId);
      if (!room || !this.isOmniRoom(room.name)) return;

      console.log(`=== 🟢 new event ${event.getType()} - ${room.name} ===`);
      console.log(`=== 🟢 message ${event.getContent().body} ===`);

      this.subscribeHandlers?.onMessage(event.getContent().body);
    });
  }

  private handleOmniEvents(): void {
    const omniEvents = Object.values(OmniMstEvents);

    this.matrixClient.on(RoomEvent.LocalEchoUpdated, (event) => {
      if (event.status !== EventStatus.SENT) return;

      const isMstEvent = omniEvents.includes(event.getType() as OmniMstEvents);

      if (!isMstEvent) return;

      const roomId = event.getRoomId();
      if (!roomId) return;

      const room = this.matrixClient.getRoom(roomId);
      if (!room || !this.isOmniRoom(room.name)) return;

      this.subscribeHandlers?.onMstEvent(
        this.createEventPayload<MSTPayload>(event),
      );
    });
  }

  // =====================================================
  // ====================== Helpers ======================
  // =====================================================

  /**
   * Create error object with a provided message
   * @param message error's message value
   * @param error optional error object
   * @return {Error}
   */
  private createError(message: string, error?: unknown): Error {
    const typedError =
      error instanceof Error
        ? error
        : new Error('Error: ', { cause: error as Error });

    return new Error(`🔶 Matrix: ${message} 🔶`, { cause: typedError });
  }

  /**
   * Verify that user is logged in
   * @param message error's message value
   * @throws {Error}
   */
  private checkClientLoggedIn(message?: string): void | never {
    if (!this.matrixClient.isLoggedIn()) {
      const throwMsg = message
        ? `🔶 ${message} 🔶`
        : '🔶 Matrix client is not logged in 🔶';
      throw new Error(throwMsg);
    }
  }

  /**
   * Verify that user is inside room
   * @param message error's message value
   * @throws {Error}
   */
  private checkInsideRoom(message?: string): void | never {
    if (!this.activeRoomId) {
      const throwMsg = message
        ? `🔶 ${message} 🔶`
        : '🔶 Matrix client is outside of room 🔶';
      throw new Error(throwMsg);
    }
  }

  /**
   * Create Invite or MST notification payload from Matrix Event
   * @param event matrix event object
   * @param params content and roomName
   * @return {Object}
   */
  private createEventPayload<T extends MSTPayload | InvitePayload>(
    event: MatrixEvent,
    params?: {
      content: OmniExtras;
      roomName: string;
    },
  ): T {
    return {
      eventId: event.getId(),
      roomId: event.getRoomId(),
      sender: event.getSender(),
      client: this.matrixClient.getUserId(),
      date: event.getDate() || new Date(),
      type: event.getType(),
      content: params?.content || event.getContent(),
      roomName: params?.roomName || '',
    } as T;
  }

  /**
   * Check room name to be an Omni room
   * @param roomName name of the room
   * @return {Boolean}
   */
  private isOmniRoom(roomName?: string): boolean {
    if (!roomName) return false;

    return /^OMNI MST \| [a-zA-Z\d]+$/.test(roomName);
  }

  /**
   * Retrieve omni_extras from room's topic event
   * @param room the room itself
   * @return {Object}
   */
  private getOmniTopic(room: Room): OmniExtras {
    // on invited, user only sees stripped state, which has '' as state key for all events
    const strippedStateKey = '';

    const topicEvent = room
      .getLiveTimeline()
      .getState(Direction.Forward)
      .events.get(EventType.RoomTopic)
      ?.get(strippedStateKey)?.event;

    return topicEvent?.content?.omni_extras;
  }

  /**
   * Set default Matrix client to be able to make requests like "isUsernameAvailable"
   */
  private createDefaultClient() {
    this.matrixClient = createClient(BASE_MATRIX_URL);
  }
}

export default Matrix;
