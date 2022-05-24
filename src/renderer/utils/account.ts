/* eslint-disable import/prefer-default-export */
import { decodeAddress, encodeAddress } from '@polkadot/keyring';
import { Wallet, Chain } from '../db/db';

export const formatAddress = (address: string, prefix = 42): string => {
  if (!address) return '';

  return encodeAddress(decodeAddress(address), prefix) || address;
};

export const getAddressFromWallet = (
  wallet: Wallet,
  network: Chain,
): string => {
  const chainAccount = wallet.chainAccounts.find(
    (c) => c.chainId === network.chainId,
  );
  const account = chainAccount || wallet.mainAccounts[0];

  return formatAddress(account.accountId, network.addressPrefix);
};
