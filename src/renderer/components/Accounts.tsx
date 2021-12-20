import React, { useEffect, useState } from 'react';
import Account from './Account';
import { Account as AccountType } from '../../common/types';

const Accounts: React.FC = () => {
  const [accounts, setAccounts] = useState<AccountType[]>([]);

  const getAccounts = async () => {
    const tempAccounts = await window.electron.accountStore.all();
    setAccounts(tempAccounts);
  };

  const removeAccount = async (address: string) => {
    const tempAccounts = await window.electron.accountStore.remove(address);
    setAccounts(tempAccounts);
  };

  useEffect(() => {
    getAccounts();
  });

  return (
    <ul className="divide-y-2 divide-gray-100">
      {accounts.map((account: AccountType) => (
        <Account
          key={account.address}
          account={account}
          onRemove={removeAccount}
        />
      ))}
    </ul>
  );
};

export default Accounts;
