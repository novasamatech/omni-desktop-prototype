import React from 'react';
import { useRecoilState } from 'recoil';
import { useLiveQuery } from 'dexie-react-hooks';
import Checkbox from '../ui/Checkbox';

import { selectedWalletsState } from '../store/selectedWallets';
import { db, Wallet } from '../db/db';

const SelectWallets: React.FC = () => {
  const [selectedWallets, setSelectedWallets] =
    useRecoilState(selectedWalletsState);

  const wallets = useLiveQuery(() => {
    return db.wallets.toArray();
  });

  const selectWallet = (wallet: Wallet) => {
    const isExist = selectedWallets.find((w) => w.id === wallet.id);

    setSelectedWallets(
      isExist
        ? selectedWallets.filter((w) => w.id !== wallet.id)
        : [...selectedWallets, wallet]
    );
  };

  return (
    <ul className="divide-y-2 divide-gray-100">
      {wallets?.map((wallet: Wallet) => (
        <li
          className="account p-3 whitespace-nowrap overflow-x-auto"
          key={wallet.id}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Checkbox
                className="mr-4"
                onChange={() => selectWallet(wallet)}
              />
              <div>{wallet.name}</div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default SelectWallets;