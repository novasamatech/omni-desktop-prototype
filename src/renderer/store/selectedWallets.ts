/* eslint-disable import/prefer-default-export */
import { atom } from 'recoil';
import { Wallet } from '../db/types';

export const selectedWalletsState = atom<Wallet[]>({
  key: 'selectedWalletsState',
  default: [],
});
