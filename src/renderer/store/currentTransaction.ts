/* eslint-disable import/prefer-default-export */
import { atom } from 'recoil';
import { TransactionData } from '../../common/types';

export const currentTransactionState = atom<TransactionData | undefined>({
  key: 'currentTransactionState',
  default: undefined,
});
