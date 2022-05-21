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
  stopClient: () => void | never;
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
  timelineMessages: () => Record<string, unknown>[] | never;
  sendMessage: (message: string) => void;
  setupSubscribers: (handlers: Callbacks) => void;
  clearSubscribers: () => void;
  checkUserExists: (userId: string) => Promise<boolean>;

  // MST operations
  mstInitiate: (params: MstInitParams) => void;
  mstApprove: (params: MstBaseParams) => void;
  mstFinalApprove: (params: MstBaseParams) => void;
  mstCancel: (params: MstCancelParams) => void;

  // Properties
  isLoggedIn: boolean;
}

// =====================================================
// ======================= General =====================
// =====================================================

export type ValueOf<T> = T[keyof T];

export const enum Membership {
  INVITE = 'invite',
  JOIN = 'join',
  LEAVE = 'leave',
}

export const enum OmniMstEvents {
  INIT = 'io.novafoundation.omni.mst_initiated',
  APPROVE = 'io.novafoundation.omni.mst_approved',
  FINAL_APPROVE = 'io.novafoundation.omni.mst_executed',
  CANCEL = 'io.novafoundation.omni.mst_cancelled',
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

export type MstBaseParams = {
  chainId: HexString; // genesis hash of the network MST sent in
  callHash: HexString;
};

export type MstInitParams = MstBaseParams & {
  callData: HexString;
  description: string;
};

export type MstCancelParams = MstBaseParams & {
  description?: string;
};

type MSTPayload<T extends MstBaseParams = MstBaseParams> = {
  roomId?: string;
  sender: string;
  content: T;
  date: Date | null;
};

type GeneralCallbacks = {
  onSyncEnd: () => void;
  onSyncProgress: () => void;
  onInvite: (roomId: string) => void;
  onMessage: (message: string) => void;
};

export type MSTCallbacks = {
  onMstInitiate: (data: MSTPayload<MstInitParams>) => void;
  onMstApprove: (data: MSTPayload) => void;
  onMstFinalApprove: (data: MSTPayload) => void;
  onMstCancel: (data: MSTPayload<MstCancelParams>) => void;
};

export type Callbacks = GeneralCallbacks & MSTCallbacks;
