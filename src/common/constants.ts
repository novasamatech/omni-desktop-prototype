export const MatrixIdRegex =
  /@[\w\d\-_]*:(?:[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?\.)+[a-z\d][a-z\d-]{0,61}[a-z\d]/i;

export const Routes = {
  // Independent routes
  LOGIN: '/login',
  BASKET: '/basket',
  NOTIFICATIONS: '/notifications',
  SHOW_CODE: '/show-code',
  SCAN_CODE: '/scan-code',
  TRANSFER_DETAILS: '/transfer-details/:id',

  // Composite routes
  TRANSFER: '/transfer',
  WALLETS: '/wallets',
  WALLET: '/wallet/:id',
  CREATE_WALLET: '/wallet/create',
  CREATE_MULTISIG_WALLET: '/multisig-wallet/create',
  EDIT_MULTISIG_WALLET: '/multisig-wallet/edit/:id',
  NETWORK_LIST: '/network-list',
  BALANCES: '/balances',
  CONTACTS: '/contacts',
  ADD_CONTACT: '/add-contact',
  EDIT_CONTACT: '/edit-contact/:id',
  CHAT: '/chat',
};

export function withId(
  link: string,
  id: { toString: () => string },
  replacer = ':id',
): string {
  return link.replace(replacer, id.toString());
}

export const enum ErrorTypes {
  REQUIRED = 'required',
  VALIDATE = 'validate',
  PATTERN = 'pattern',
}

export const DEFAULT = 'default';

export const enum Suffix {
  MILLIONS = 'M',
  BILLIONS = 'B',
  TRILLIONS = 'T',
}

export const enum Decimal {
  SMALL_NUMBER = 5,
  BIG_NUMBER = 2,
}

export const enum StatusType {
  WAITING = 'waiting',
  SUCCESS = 'success',
  ABSTAINED = 'abstained',
}
