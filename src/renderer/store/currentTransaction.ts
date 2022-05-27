/* eslint-disable import/prefer-default-export */
import { atom } from 'recoil';
import { UnsignedTransaction } from '@substrate/txwrapper-polkadot';
import { Transaction, Wallet } from '../db/types';

export const currentTransactionState = atom<Transaction | undefined>({
  key: 'currentTransactionState',
  default: undefined,
});

export const currentUnsignedState = atom<UnsignedTransaction | undefined>({
  key: 'currentUnsignedState',
  default: undefined,
});

export const signFromState = atom<Wallet | undefined>({
  key: 'signFromState',
  default: undefined,
});
