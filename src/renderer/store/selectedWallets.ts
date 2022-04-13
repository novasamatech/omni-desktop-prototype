/* eslint-disable import/prefer-default-export */
import { atom } from 'recoil';
import { Wallet } from '../db/db';

export const selectedWalletsState = atom<Wallet[]>({
  key: 'selectedWalletsState',
  default: [],
});
