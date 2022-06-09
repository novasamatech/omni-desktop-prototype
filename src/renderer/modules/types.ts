import { EventType, Room } from 'matrix-js-sdk';
import { HexString } from '../../common/types';

// =====================================================
// ============ SecureMessenger interface ==============
// =====================================================

export interface ISecureMessenger {
  // Init
  init: () => Promise<void | never>;
  loginWithCreds: (login: string, password: string) => Promise<void | never>;
  loginFromCache: () => Promise<void | never>;
  stopClient: () => void;
  logout: () => Promise<void | never>;

  // Actions
  startRoomCreation: (
    mstAccountAddress: string,
  ) => Promise<RoomSignature | never>;
  finishRoomCreation: (params: RoomParams) => Promise<void | never>;
  cancelRoomCreation: (roomId: string) => Promise<void | never>;
  joinRoom: (roomId: string) => Promise<void | never>;
  invite: (roomId: string, signatoryId: string) => Promise<void | never>;
  listOfOmniRooms: (type: Membership.INVITE | Membership.JOIN) => Room[];
  setRoom: (roomId: string) => void;
  timelineEvents: () => Promise<MSTPayload[] | never>;
  sendMessage: (message: string) => void;
  setupSubscribers: (handlers: Callbacks) => void;
  clearSubscribers: () => void;
  checkUserExists: (userId: string) => Promise<boolean>;

  // MST operations
  mstInitiate: (params: MstParams) => void;
  mstApprove: (params: MstParams) => void;
  mstFinalApprove: (params: MstParams) => void;
  mstCancel: (params: MstParams) => void;

  // Properties
  userId: string;
  isLoggedIn: boolean;
  isSynced: boolean;
}

// =====================================================
// ======================= General =====================
// =====================================================

export const enum Membership {
  INVITE = 'invite',
  JOIN = 'join',
  LEAVE = 'leave',
}

export type Signatory = {
  matrixAddress: string;
  accountId: string;
  isInviter?: boolean;
};

export type RoomSignature = Record<'roomId' | 'sign', string>;

export type RoomParams = {
  roomId: string;
  signature: string;
  accountName: string;
  mstAccountAddress: string;
  inviterPublicKey: string;
  threshold: number;
  signatories: Signatory[];
};

export type OmniExtras = {
  mst_account: {
    accountName: string;
    threshold: number;
    signatories: string[];
    address: string;
  };
  invite: {
    signature: string;
    public_key: string;
  };
};

// =====================================================
// ============== MST Events / Callbacks ===============
// =====================================================

export enum OmniMstEvents {
  INIT = 'io.novafoundation.omni.mst_initiated',
  APPROVE = 'io.novafoundation.omni.mst_approved',
  FINAL_APPROVE = 'io.novafoundation.omni.mst_executed',
  CANCEL = 'io.novafoundation.omni.mst_cancelled',
}

export type MstParams = {
  senderAddress: string;
  chainId: HexString;
  callHash: HexString;
  callData?: HexString;
  extrinsicHash?: HexString;
  description?: string;
};

type EventPayload = {
  eventId: string;
  roomId: string;
  sender: string;
  client: string;
  roomName?: string;
  date: Date;
};

export type InvitePayload = EventPayload & {
  content: OmniExtras;
  type: EventType.RoomMember;
};

export type MSTPayload = EventPayload & {
  content: MstParams;
  type: OmniMstEvents;
};

export type CombinedEventPayload = InvitePayload | MSTPayload;

type GeneralCallbacks = {
  onSyncEnd: () => void;
  onSyncProgress: () => void;
  onInvite: (data: InvitePayload) => void;
  onMessage: (message: string) => void;
};

export type MSTCallbacks = {
  onMstEvent: (data: MSTPayload) => void;
};

export type Callbacks = GeneralCallbacks & MSTCallbacks;
