/* eslint-disable import/prefer-default-export */
import { ApiPromise } from '@polkadot/api';
import { ProviderInterface } from '@polkadot/rpc-provider/types';
import { atom } from 'recoil';
import { Chain } from '../db/db';

export type Connection = {
  network: Chain;
  api: ApiPromise;
  provider?: ProviderInterface;
};

export const connectionState = atom<Record<string, Connection>>({
  key: 'connectionState',
  default: {},
  dangerouslyAllowMutability: true,
});
