import React from 'react';
import { useRecoilValue } from 'recoil';
import WalletBalances from './WalletBalances';
import { selectedWalletsState } from '../../store/selectedWallets';

const Balances: React.FC = () => {
  const selectedWallets = useRecoilValue(selectedWalletsState);

  return (
    <div>
      <h2 className="font-light text-xl p-4">Balances</h2>

      <div className="m-2">
        {selectedWallets?.map((wallet) => (
          <WalletBalances key={wallet?.id} wallet={wallet} />
        ))}
      </div>
    </div>
  );
};

export default Balances;
