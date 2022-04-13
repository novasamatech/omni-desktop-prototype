import React from 'react';
import { useRecoilValue } from 'recoil';
import '@polkadot/api-augment';
import { selectedAccountsState } from '../../store/selectedAccounts';
import Balance from './Balance';

const Balances: React.FC = () => {
  const selectedAccounts = useRecoilValue(selectedAccountsState);

  return (
    <>
      <h2 className="font-light text-xl p-4">Balances</h2>

      <div className="m-2">
        {selectedAccounts.map(({ address }) => (
          <Balance key={address} address={address} />
        ))}
      </div>
    </>
  );
};

export default Balances;
