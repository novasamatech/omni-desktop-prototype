/* eslint-disable import/prefer-default-export */
import { atom } from 'recoil';
import { UnsignedTransaction } from '@substrate/txwrapper-polkadot';
import { TransactionData } from '../../common/types';

export const currentTransactionState = atom<TransactionData | undefined>({
  key: 'currentTransactionState',
  default: undefined,
});

export const currentUnsignedState = atom<UnsignedTransaction | undefined>({
  key: 'currentUnsignedState',
  default: undefined,
});
