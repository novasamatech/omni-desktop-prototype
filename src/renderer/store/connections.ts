/* eslint-disable import/prefer-default-export */
import { ApiPromise } from '@polkadot/api';
import { atom } from 'recoil';
import { Chain } from '../db/types';

export type Connection = {
  network: Chain;
  api: ApiPromise;
};

export const connectionState = atom<Record<string, Connection>>({
  key: 'connectionState',
  default: {},
  dangerouslyAllowMutability: true,
});
