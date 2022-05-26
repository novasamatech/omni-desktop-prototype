import React from 'react';
import { useRecoilState } from 'recoil';
import { useLiveQuery } from 'dexie-react-hooks';
import Checkbox from '../ui/Checkbox';

import { selectedWalletsState } from '../store/selectedWallets';
import { db } from '../db/db';
import { Wallet } from '../db/types';
import mst from '../../../assets/mst.svg';
import { isMultisig } from '../utils/validation';

const SelectWallets: React.FC = () => {
  const [selectedWallets, setSelectedWallets] =
    useRecoilState(selectedWalletsState);

  const wallets = useLiveQuery(() => db.wallets.toArray());

  const isWalletSelected = (walletId?: number) => {
    return selectedWallets.some((w) => w.id === walletId);
  };

  const selectWallet = (wallet: Wallet) => {
    setSelectedWallets(
      isWalletSelected(wallet.id)
        ? selectedWallets.filter((w) => w.id !== wallet.id)
        : selectedWallets.concat(wallet),
    );
  };

  if (!wallets || wallets.length === 0) {
    return null;
  }

  return (
    <ul className="divide-y-2 divide-gray-100">
      {wallets.map((wallet) => (
        <li
          className="account p-3 whitespace-nowrap overflow-x-auto"
          key={wallet.id}
        >
          <div className="flex items-center justify-between select-none">
            <Checkbox
              className="flex-1"
              label={wallet.name}
              checked={isWalletSelected(wallet.id)}
              onChange={() => selectWallet(wallet)}
            />
            {isMultisig(wallet) && (
              <div className="flex items-center ml-2">
                <img src={mst} alt="mst" className="h-4 ml-2" />
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default SelectWallets;
