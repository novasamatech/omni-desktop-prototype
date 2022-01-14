/* eslint-disable import/prefer-default-export */
import { atom } from 'recoil';
import { Account } from '../../common/types';

export const selectedAccountsState = atom<Account[]>({
  key: 'selectedAccountsState',
  default: [],
});
