import { atom, selector } from 'recoil';

export const transactionBusketState = atom<any[]>({
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

export default transactionBusketState;
