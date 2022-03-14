import { ApiPromise } from '@polkadot/api';
import { ProviderInterface } from '@polkadot/rpc-provider/types';

export type Account = {
  address: string;
  accountName: string;
};

export type Connection = {
  network: Network;
  api: ApiPromise;
  provider?: ProviderInterface;
};

export type Network = {
  name: string;
  genesisHash: string;
  chainName?: any;
  chainSpec?: string;
  parachains?: Network[];
};

export type TransactionData = {
  address: string;
  type: string;
  payload?: any;
  signature?: string;
  network: string;
};

export interface ElectronApi {
  accountStore: {
    all: () => Promise<Account[]>;
    remove: (address: string) => Promise<Account[]>;
    add: (account: Account) => Promise<Account[]>;
  };
  networkStore: {
    all: () => Promise<Network[]>;
    remove: (name: string) => Promise<Network[]>;
    add: (network: Account) => Promise<Network[]>;
  };
}

declare global {
  interface Window {
    electron: ElectronApi;
  }
}
