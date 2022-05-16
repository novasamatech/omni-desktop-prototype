/* eslint-disable import/prefer-default-export */
import { ApiPromise } from '@polkadot/api';

export const getPendingMultisigTransactions = async (
  api: ApiPromise,
  account: string
) => {
  const txs = await api.query.multisig.multisigs(account);
  return txs;
};
