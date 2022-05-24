import { Room } from 'matrix-js-sdk';
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
  createRoom: (
    params: RoomCreation,
    signWithParity: (value: string) => Promise<string>,
  ) => Promise<void | never>;
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
  matrixAddress: `@${string}`;
  networkAddress: HexString;
  isInviter: boolean;
};

export type RoomCreation = {
  mstAccountAddress: HexString;
  inviterPublicKey: string;
  threshold: number;
  signatories: Signatory[];
};

// =====================================================
// ============== MST Events / Callbacks ===============
// =====================================================

// TODO: find better TS solution for OMNI_MST_EVENTS
export const enum OmniMstEvents {
  INIT = 'io.novafoundation.omni.mst_initiated',
  APPROVE = 'io.novafoundation.omni.mst_approved',
  FINAL_APPROVE = 'io.novafoundation.omni.mst_executed',
  CANCEL = 'io.novafoundation.omni.mst_cancelled',
}

export type MstParams = {
  chainId: HexString;
  callHash: HexString;
  callData?: HexString;
  description?: string;
};

export type MSTPayload = {
  eventId: string;
  roomId?: string;
  sender: string;
  client: string;
  content: MstParams;
  type: OmniMstEvents;
  date: Date;
};

type GeneralCallbacks = {
  onSyncEnd: () => void;
  onSyncProgress: () => void;
  onInvite: (roomId: string) => void;
  onMessage: (message: string) => void;
};

export type MSTCallbacks = {
  onMstEvent: (data: MSTPayload) => void;
};

export type Callbacks = GeneralCallbacks & MSTCallbacks;
