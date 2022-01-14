import React from 'react';
// import { SingleAddress } from '@polkadot/ui-keyring/observable/types';
import { Account as AccountType } from '../../common/types';
import Checkbox from '../ui/Checkbox';
import Address from '../ui/Address';

type Props = {
  account: AccountType;
  onRemove: (address: string) => void;
  onSelect: (account: AccountType) => void;
};

const Account: React.FC<Props> = ({ account, onRemove, onSelect }: Props) => {
  const { address, accountName } = account;

  return (
    <li className="account p-3 whitespace-nowrap overflow-x-auto" key={address}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Checkbox className="mr-4" onChange={() => onSelect(account)} />
          <div>
            <div>{accountName}</div>
            <div className="flex items-center">
              <Address address={address} />
            </div>
          </div>
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
