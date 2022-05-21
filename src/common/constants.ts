export const MatrixIdRegex =
  /@[\w\d\-_]*:(?:[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?\.)+[a-z\d][a-z\d-]{0,61}[a-z\d]/i;

export const Routes = {
  // Independent routes
  LOGIN: '/login',
  BASKET: '/basket',
  NOTIFICATIONS: '/notifications',
  SHOW_CODE: '/show-code',
  SCAN_CODE: '/scan-code',

  // Composite routes
  TRANSFER: '/transfer',
  WALLETS: '/wallets',
  WALLET: '/wallet/:id',
  CREATE_WALLET: '/wallet/create',
  CREATE_MULTISIG_WALLET: '/multisig-wallet/create',
  EDIT_MULTISIG_WALLET: '/multisig-wallet/edit/:id',
  CHAT: '/chat',
  NETWORK_LIST: '/network-list',
  BALANCES: '/balances',
  CONTACTS: '/contacts',
  ADD_CONTACT: '/add-contact',
  EDIT_CONTACT: '/edit-contact/:id',
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
