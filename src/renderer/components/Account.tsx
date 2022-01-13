import React from 'react';
import Identicon from '@polkadot/react-identicon';
// import { SingleAddress } from '@polkadot/ui-keyring/observable/types';
import { Account as AccountType } from '../../common/types';
import { shortAddress } from '../utils/strings';

type Props = {
  account: AccountType;
  onRemove: (address: string) => void;
  onSelect: (account: AccountType) => void;
};

const Account: React.FC<Props> = ({ account, onRemove, onSelect }: Props) => {
  const theme = 'polkadot';
  const size = 16;
  const { address, accountName } = account;

  return (
    <li className="account p-3 whitespace-nowrap overflow-x-auto" key={address}>
      <div className="flex items-center">
        <input
          className="mr-1"
          type="checkbox"
          onChange={() => onSelect(account)}
        />
        <div>{accountName}</div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Identicon
            className="mr-1"
            value={address}
            size={size}
            theme={theme}
          />
          <div className="text-gray-500">{shortAddress(address)}</div>
        </div>
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
