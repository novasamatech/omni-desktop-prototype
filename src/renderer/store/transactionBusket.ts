import { atom, selector } from 'recoil';
import { TransactionData } from '../../common/types';

export const transactionBusketState = atom<TransactionData[]>({
  key: 'transactionBusketState',
  default: [],
});

export const transactionBusketDataState = selector({
  key: 'transactionBusketDataState',
  get: ({ get }) => {
    const transactions = get(transactionBusketState);
    const transactionsAmount = transactions.length;

    return {
      transactionsAmount,
    };
  },
});
