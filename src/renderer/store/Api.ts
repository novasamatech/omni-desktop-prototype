/* eslint-disable import/prefer-default-export */
import { atom } from 'recoil';
import { ApiPromise } from '@polkadot/api';

export const apiState = atom<ApiPromise | undefined>({
  key: 'apiState',
  default: undefined,
});
