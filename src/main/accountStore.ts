import Store from 'electron-store';
import { IpcMainHandler, registerIpcHandler } from './ipc';
import { Account } from '../common/types';

const store = new Store();
const ACCOUNTS_KEY = 'OMNI-ACCOUNT-2';

export const accountStoreIpcHandler = (): IpcMainHandler => ({
  'account-store-all': () => {
    return store.get(ACCOUNTS_KEY) || [];
  },
  'account-store-add': async (account: Account) => {
    const accounts = store.get(ACCOUNTS_KEY) || [];
    const newAccounts = [...(accounts as Account[]), account];

    store.set(ACCOUNTS_KEY, newAccounts);
    return accounts;
  },
  'account-store-remove': async (accountId: string) => {
    const accounts = store.get(ACCOUNTS_KEY) || [];
    const newAccounts = (accounts as Account[]).filter(
      (a: Account) => a.accountId !== accountId
    );

    store.set(ACCOUNTS_KEY, newAccounts);
    return accounts;
  },
});

export const registerAccountStoreHandlers = (): void => {
  registerIpcHandler(accountStoreIpcHandler());
};
