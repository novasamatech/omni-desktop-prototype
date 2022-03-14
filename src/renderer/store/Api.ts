/* eslint-disable import/prefer-default-export */
import { atom } from 'recoil';
import { Connection } from '../../common/types';

export const apiState = atom<Connection[]>({
  key: 'apiState',
  default: [],
});

export const activeApiState = atom<Connection[]>({
  key: 'activeApiState',
  default: [],
});
