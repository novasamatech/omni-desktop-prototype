export type Account = {
  address: string;
  accountName: string;
};

export interface ElectronApi {
  accountStore: {
    all: () => Promise<Account[]>;
    remove: (address: string) => Promise<Account[]>;
    add: (account: Account) => Promise<Account[]>;
  };
}

declare global {
  interface Window {
    electron: ElectronApi;
  }
}
