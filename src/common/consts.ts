/* eslint-disable import/prefer-default-export */
export const Routes = {
  BASKET: '/basket',
  SHOW_CODE: '/show-code',
  SCAN_CODE: '/scan-code',
  TRANSFER: '/transfer',
  WALLETS: '/wallets',
  WALLET: '/wallet/:id',
  CREATE_WALLET: '/wallets/create',
  CREATE_MULTISIG_WALLET: '/multisig-wallet/create',
  EDIT_MULTISIG_WALLET: '/multisig-wallet/edit/:id',
  CHAT: '/chat',
  NETWORK_LIST: '/network-list',
  BALANCES: '/balances',
  CONTACTS: '/contacts',
  ADD_CONTACT: '/add-contact',
  EDIT_CONTACT: '/edit-contact/:id',
};

export const withId = (link: string, id: any, replacer = ':id'): string => {
  return link.replace(replacer, id.toString());
};

export const enum ErrorTypes {
  REQUIRED = 'required',
  VALIDATE = 'validate',
}
