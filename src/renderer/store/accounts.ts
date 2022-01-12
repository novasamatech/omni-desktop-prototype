import { atom } from 'recoil';
import { Account } from '../../common/types';

export const accountsState = atom<Account[]>({
  key: 'accountsState',
  default: [],
});

export default accountsState;
