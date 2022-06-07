export type HexString = `0x${string}`;

export type Account = {
  address: string;
  accountName: string;
};

export type TransactionData = {
  address: string;
  type: string;
  payload?: any;
  extrinsicPayload?: any;
  signature?: string;
  network: string;
};

export type Approval = {
  address: string;
  fromBlockChain: boolean;
  fromMatrix: boolean;
  extrinsicHash?: HexString;
};

export type Approvals = Record<string, Approval>;

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
