import React from 'react';
import { Account as AccountType } from '../../common/types';

type Prop = {
  account: AccountType;
  onRemove: (accountId: string) => void;
};

const Account: React.FC<Prop> = ({
  account: { accountId, accountName },
  onRemove,
}: Prop) => {
  return (
    <li
      className="account p-3 flex whitespace-nowrap overflow-x-auto justify-between"
      key={accountId}
    >
      <div>{accountName}</div>
      <div>{accountId}</div>
      <button
        type="button"
        className="account-remove"
        onClick={() => onRemove(accountId)}
      >
        x
      </button>
    </li>
  );
};

export default Account;
