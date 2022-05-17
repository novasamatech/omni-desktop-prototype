import Dexie, { Table } from 'dexie';
import { HexString } from '../../common/types';

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
  ASSET_TRANSFER = 'asset_transfer',
  MULTISIG_TRANSFER = 'multisig_transfer',
  MULTISIG_SIGN = 'multisig_sign',
  MULTISIG_CANCEL = 'multisig_cancel',
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

export type Wallet = {
  id?: number;
  name: string;
  mainAccounts: Account[];
  chainAccounts: ChainAccount[];
};

export type MultisigWallet = Wallet & {
  originContacts: Contact[];
  threshold: number;
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

export type Chain = {
  id?: number;
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
  addressPrefix?: number;
};

export type ChainConnection = {
  id?: number;
  chainId: HexString;
  activeType: ActiveType;
};

export type Contact = {
  id?: number;
  name: string;
  mainAccounts: Account[];
  chainAccounts: ChainAccount[];
  secureProtocolId: string;
};

export const enum AuthState {
  NOT_LOGGED_IN = 0,
  LOGGED_IN = 1,
}

export type Credential = {
  id?: number;
  userId: string;
  accessToken: string;
  deviceId: string;
  isLoggedIn: AuthState;
};

export type Transaction = {
  id?: number;
  wallet: Wallet;
  chainId: HexString;
  address: string;
  blockHash?: HexString;
  transactionHash?: HexString;
  type: TransactionType;
  status: TransactionStatus;
  data: Record<string, any>;
  createdAt: Date;
};

export class OmniDexie extends Dexie {
  wallets!: Table<Wallet | MultisigWallet>;

  chains!: Table<Chain>;

  connections!: Table<ChainConnection>;

  contacts!: Table<Contact>;

  transactions!: Table<Transaction>;

  matrixCredentials!: Table<Credential>;

  constructor() {
    super('omniDatabase');
    this.version(53).stores({
      wallets: '++id,name',
      chains: '++id,&chainId,parentId,name,activeType',
      connections: '++id,&chainId,activeType',
      contacts: '++id,name,secureProtocolId',
      transactions: '++id,chainId,address,type,status',
      matrixCredentials: '++id,userId,accessToken,deviceId,isLoggedIn',
    });
  }
}

export const db = new OmniDexie();
