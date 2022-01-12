import React from 'react';
import Identicon from '@polkadot/react-identicon';
// import { SingleAddress } from '@polkadot/ui-keyring/observable/types';
import { Account as AccountType } from '../../common/types';

type Props = {
  account: AccountType;
  onRemove: (address: string) => void;
  onSelect: (account: AccountType) => void;
};

const shortAddress = (address: string): string => {
  return address.length < 9
    ? address
    : `${address.substring(0, 5)}...${address.substring(address.length - 5)}`;
};

const Account: React.FC<Props> = ({ account, onRemove, onSelect }: Props) => {
  const theme = 'polkadot';
  const size = 32;
  const { address, accountName } = account;

  return (
    <li className="account p-3 whitespace-nowrap overflow-x-auto" key={address}>
      <div className="flex items-center">
        <input type="checkbox" onChange={() => onSelect(account)} />
        <Identicon value={address} size={size} theme={theme} />
        <div>{accountName}</div>
      </div>
      <div className="flex items-center justify-between">
        <div>{shortAddress(address)}</div>
        <button
          type="button"
          className="account-remove"
          onClick={() => onRemove(address)}
        >
          x
        </button>
      </div>
    </li>
  );
};

export default Account;
