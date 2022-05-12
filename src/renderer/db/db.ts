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

export interface Wallet {
  id?: number;
  name: string;
  mainAccounts: Account[];
  chainAccounts: ChainAccount[];
}

export interface MultisigWallet extends Wallet {
  originContacts: Contact[];
  threshold: number;
}

export interface StatemineExtras {
  assetId: string;
}

export interface OrmlExtras {
  currencyIdScale: string;
  currencyIdType: string;
  existentialDeposit: string;
  transfersEnabled?: boolean;
}

export interface Account {
  accountId: string;
  publicKey: string;
  cryptoType: CryptoType;
}

export interface ChainAccount extends Account {
  chainId: HexString;
}

export interface Asset {
  assetId: number;
  symbol: string;
  precision: number;
  icon?: string;
  priceId?: string;
  staking?: string;
  type?: AssetType;
  typeExtras?: StatemineExtras | OrmlExtras;
}

export interface NodeApiKey {
  queryName: string;
  keyName: string;
}

export interface ChainNode {
  name: string;
  url: string;
  apiKey: NodeApiKey;
}

export enum ChainOptions {
  crowloans = 'crowloans',
  etheriumBased = 'etheriumBased',
  testnet = 'testnet',
}

export interface ExternalApi {
  type: string;
  url: string;
}

export interface ExternalApiSet {
  history?: ExternalApi;
  stacking?: ExternalApi;
  crowdloans?: ExternalApi;
}

export interface Expolorer {
  name: string;
  account?: string;
  extrinsic?: string;
  event?: string;
}

export enum ActiveType {
  DISABLED = 'disabled',
  LOCAL_NODE = 'localNode',
  EXTERNAL_NODE = 'externalNode',
}

export interface Chain {
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
}

export interface ChainConnection {
  id?: number;
  chainId: HexString;
  activeType: ActiveType;
}

export type Contact = {
  id?: number;
  name: string;
  mainAccounts: Account[];
  chainAccounts: ChainAccount[];
  secureProtocolId: string;
};

export class OmniDexie extends Dexie {
  wallets!: Table<Wallet | MultisigWallet>;

  chains!: Table<Chain>;

  connections!: Table<ChainConnection>;

  contacts!: Table<Contact>;

  constructor() {
    super('omniDatabase');
    this.version(51).stores({
      wallets: '++id,name',
      chains: '++id,&chainId,parentId,name,activeType',
      connections: '++id,&chainId,activeType',
      contacts: '++id,name,secureProtocolId',
    });
  }
}

export const db = new OmniDexie();
