/* eslint-disable import/prefer-default-export */
import { atom } from 'recoil';
import { Account } from '../../common/types';

export const accountsState = atom<Account[]>({
  key: 'accountsState',
  default: [],
});
