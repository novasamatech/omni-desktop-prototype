import React from 'react';
import Identicon from '@polkadot/react-identicon';
// import { SingleAddress } from '@polkadot/ui-keyring/observable/types';
import { Account as AccountType } from '../../common/types';

type Props = {
  account: AccountType;
  onRemove: (address: string) => void;
};

const shortAddress = (address: string): string => {
  return address.length < 9
    ? address
    : `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
};

const Account: React.FC<Props> = ({
  account: { address, accountName },
  onRemove,
}: Props) => {
  const theme = 'polkadot';
  const size = 32;

  return (
    <li className="account p-3 whitespace-nowrap overflow-x-auto" key={address}>
      <Identicon value={address} size={size} theme={theme} />
      <div>{accountName}</div>
      <div>{shortAddress(address)}</div>
      <button
        type="button"
        className="account-remove"
        onClick={() => onRemove(address)}
      >
        x
      </button>
    </li>
  );
};

export default Account;
