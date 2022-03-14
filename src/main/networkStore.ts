import Store from 'electron-store';
import { IpcMainHandler, registerIpcHandler } from './ipc';
import { Network } from '../common/types';

const store = new Store();
const NETWORK_KEY = 'OMNI-NETWORK';

export const networkStoreIpcHandler = (): IpcMainHandler => ({
  'network-store-all': () => {
    return store.get(NETWORK_KEY) || [];
  },
  'network-store-add': async (network: Network) => {
    const networks = store.get(NETWORK_KEY) || [];
    const newAccounts = [...(networks as Network[]), network];

    store.set(NETWORK_KEY, newAccounts);
    return newAccounts;
  },
  'network-store-remove': async (genesisHash: string) => {
    const networks = store.get(NETWORK_KEY) || [];
    const newNetworks = (networks as Network[]).filter(
      (n: Network) => n.genesisHash !== genesisHash
    );

    store.set(NETWORK_KEY, newNetworks);
    return newNetworks;
  },
});

export const registerNetworkStoreHandlers = (): void => {
  registerIpcHandler(networkStoreIpcHandler());
};
