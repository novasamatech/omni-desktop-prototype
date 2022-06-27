import { HexString } from '../../common/types';
import { CombinedEventPayload } from '../modules/types';

export const enum CryptoType {
  SR25519,
  ED25519,
  ECDSA,
  ETHEREUM,
}

export const enum SubstrateCryptoType {
  SR25519,
  ED25519,
  ECDSA,
}

export const enum ChainClass {
  ETHERIUM,
  SUBSTRATE,
}

export const enum AssetType {
  ORML = 'orml',
  STATEMINE = 'statemine',
}

export const enum TransactionType {
  TRANSFER = 'transfer',
  MULTISIG_TRANSFER = 'multisig_transfer',
  CANCEL = 'cancel',
}

export const enum TransactionStatus {
  CREATED = 'created',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}

export const enum ChainOptions {
  crowloans = 'crowloans',
  etheriumBased = 'etheriumBased',
  testnet = 'testnet',
}

export const enum ActiveType {
  DISABLED = 'disabled',
  LOCAL_NODE = 'localNode',
  EXTERNAL_NODE = 'externalNode',
}

export const enum BooleanValue {
  FALSE = 0,
  TRUE = 1,
}

// TODO: move Domain types (Wallet, etc.) from DB and make ID mandatory
type WithID<Obj, T extends string | number = number> = Obj & {
  id?: T;
};

export type Wallet = WithID<{
  name: string;
  mainAccounts: Account[];
  chainAccounts: ChainAccount[];
  isMultisig: BooleanValue;
}>;

export type MultisigWallet = Wallet & {
  originContacts: Contact[];
  threshold: string;
  matrixRoomId?: string;
};

export type StatemineExtras = {
  assetId: string;
};

export type OrmlExtras = {
  currencyIdScale: string;
  currencyIdType: string;
  existentialDeposit: string;
  transfersEnabled?: boolean;
};

export type Account = {
  accountId: string;
  publicKey: string;
  cryptoType: CryptoType;
};

export type ChainAccount = Account & {
  chainId: HexString;
};

export type Asset = {
  assetId: number;
  symbol: string;
  precision: number;
  icon?: string;
  priceId?: string;
  staking?: string;
  type?: AssetType;
  typeExtras?: StatemineExtras | OrmlExtras;
};

export type NodeApiKey = {
  queryName: string;
  keyName: string;
};

export type ChainNode = {
  name: string;
  url: string;
  apiKey: NodeApiKey;
};

export type ExternalApi = {
  type: string;
  url: string;
};

export type ExternalApiSet = {
  history?: ExternalApi;
  stacking?: ExternalApi;
  crowdloans?: ExternalApi;
};

export type Expolorer = {
  name: string;
  account?: string;
  extrinsic?: string;
  event?: string;
};

export type Chain = WithID<{
  chainId: HexString;
  parentId?: HexString;
  name: string;
  assets: Asset[];
  nodes: ChainNode[];
  color?: string;
  icon?: string;
  options?: ChainOptions[];
  externalApi?: ExternalApiSet;
  explorers?: Expolorer[];
  // TODO: Store connection information in separate table
  activeType: ActiveType;
  addressPrefix: number;
}>;

export type ChainConnection = WithID<{
  chainId: HexString;
  activeType: ActiveType;
}>;

export type Contact = WithID<{
  name?: string;
  mainAccounts: Account[];
  chainAccounts: ChainAccount[];
  secureProtocolId: string;
}>;

export type Credential = WithID<{
  userId: string;
  userName: string;
  accessToken: string;
  deviceId: string;
  isLoggedIn: BooleanValue;
}>;

export type Transaction = WithID<{
  wallet: Wallet | MultisigWallet;
  chainId: HexString;
  address: string;
  blockHash?: HexString;
  blockHeight?: number;
  extrinsicIndex?: number;
  transactionHash?: HexString;
  type: TransactionType;
  status: TransactionStatus;
  data: Record<string, any>;
  createdAt: Date;
}>;

export type Notification = WithID<
  Omit<CombinedEventPayload, 'eventId'> & {
    isRead: BooleanValue;
  },
  string
>;
