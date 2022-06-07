/* eslint-disable import/prefer-default-export */
import { decodeAddress, encodeAddress } from '@polkadot/keyring';
import { createKeyMulti } from '@polkadot/util-crypto';
import { u8aToHex } from '@polkadot/util';
import {
  Account,
  BooleanValue,
  Chain,
  ChainAccount,
  Contact,
  CryptoType,
  MultisigWallet,
} from '../db/types';
import { Approvals } from '../../common/types';

const SS58_DEFAULT_PREFIX = 42;

export const formatAddress = (
  address: string,
  prefix = SS58_DEFAULT_PREFIX,
): string => {
  if (!address) return '';

  return encodeAddress(decodeAddress(address), prefix) || address;
};

export const toPublicKey = (address: string): string => {
  if (!address) return '';

  return u8aToHex(decodeAddress(address));
};

type WalletAccounts = {
  chainAccounts: ChainAccount[];
  mainAccounts: Account[];
};
export const getAddressFromWallet = <T extends WalletAccounts>(
  wallet: T,
  network?: Chain,
): string => {
  const chainAccount = wallet.chainAccounts.find(
    (c) => c.chainId === network?.chainId,
  );
  const account = chainAccount || wallet.mainAccounts[0];

  if (!account) return '';

  return formatAddress(account.accountId, network?.addressPrefix);
};

type MultisigWalletProps = {
  walletName: string;
  threshold: string | number;
  addresses: string[];
  contacts: Contact[];
  matrixRoomId?: string;
};
export const createMultisigWalletPayload = ({
  walletName,
  threshold,
  addresses,
  contacts,
  matrixRoomId,
}: MultisigWalletProps): {
  mstSs58Address: string;
  payload: MultisigWallet;
} => {
  const multiAddress = createKeyMulti(addresses, Number(threshold));
  const Ss58Address = encodeAddress(multiAddress, SS58_DEFAULT_PREFIX);

  return {
    mstSs58Address: Ss58Address,
    payload: {
      name: walletName.trim(),
      threshold: threshold.toString(),
      originContacts: contacts,
      isMultisig: BooleanValue.TRUE,
      chainAccounts: [],
      matrixRoomId,
      mainAccounts: [
        {
          accountId: Ss58Address,
          publicKey: u8aToHex(multiAddress),
          cryptoType: CryptoType.ED25519,
        },
      ],
    },
  };
};

export const isSameAccount = (first: Contact, second: Contact): boolean =>
  first.mainAccounts[0].publicKey === second.mainAccounts[0].publicKey &&
  first.id === second.id;

export const getApprovalsFromWallet = (
  wallet: MultisigWallet,
  network?: Chain,
) =>
  wallet.originContacts.reduce((acc, contact) => {
    const contactAddress = toPublicKey(getAddressFromWallet(contact, network));
    acc[contactAddress] = {
      address: contactAddress,
      fromBlockChain: false,
      fromMatrix: false,
    };

    return acc;
  }, {} as Approvals);
