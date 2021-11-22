export type Account = {
  accountId: string;
  accountName: string;
};

export interface ElectronApi {
  accountStore: {
    all: () => Promise<Account[]>;
    remove: (accountId: string) => Promise<Account[]>;
    add: (account: Account) => Promise<Account[]>;
  };
}

declare global {
  interface Window {
    electron: ElectronApi;
  }
}
