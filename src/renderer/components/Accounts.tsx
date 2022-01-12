import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';

import Account from './Account';
import { Account as AccountType } from '../../common/types';
import { selectedAccountsState } from '../store/selectedAccounts';

const Accounts: React.FC = () => {
  const [accounts, setAccounts] = useState<AccountType[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useRecoilState(
    selectedAccountsState
  );

  useEffect(() => {
    console.log(selectedAccounts);
  }, [selectedAccounts]);

  const selectAccount = (account: AccountType) => {
    const isExist = selectedAccounts.find((a) => a.address === account.address);
    setSelectedAccounts(
      isExist
        ? selectedAccounts.filter((a) => a.address !== account.address)
        : [...selectedAccounts, account]
    );
  };

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
          onSelect={selectAccount}
        />
      ))}
    </ul>
  );
};

export default Accounts;
