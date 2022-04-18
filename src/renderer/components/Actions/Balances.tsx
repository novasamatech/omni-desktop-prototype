import React from 'react';
import { useRecoilValue } from 'recoil';
import AccountBalances from './AccountBalances';
import { selectedWalletsState } from '../../store/selectedWallets';

const Balances: React.FC = () => {
  const selectedWallets = useRecoilValue(selectedWalletsState);

  return (
    <>
      <h2 className="font-light text-xl p-4">Balances</h2>

      <div className="m-2">
        {selectedWallets.map((wallet) => (
          <AccountBalances key={wallet.id} wallet={wallet} />
        ))}
      </div>
    </>
  );
};

export default Balances;
