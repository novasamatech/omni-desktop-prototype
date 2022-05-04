import React from 'react';
import { useRecoilState } from 'recoil';
import { useLiveQuery } from 'dexie-react-hooks';
import Checkbox from '../ui/Checkbox';

import { selectedWalletsState } from '../store/selectedWallets';
import { db, MultisigWallet, Wallet } from '../db/db';
import mst from '../../../assets/mst.svg';

const SelectWallets: React.FC = () => {
  // TODO: select wallets after hot update on interface
  const [selectedWallets, setSelectedWallets] =
    useRecoilState(selectedWalletsState);

  const wallets = useLiveQuery(() => db.wallets.toArray());

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
            {(wallet as MultisigWallet).originContacts?.length && (
              <div className="flex items-center">
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
