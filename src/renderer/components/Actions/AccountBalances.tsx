import React from 'react';
import { useRecoilValue } from 'recoil';
import '@polkadot/api-augment';

import { connectionState } from '../../store/api';
import { Wallet } from '../../db/db';
import Card from '../../ui/Card';
import NetworkBalances from './NetworkBalances';

type Props = {
  wallet: Wallet;
};

const AccountBalances: React.FC<Props> = ({ wallet }: Props) => {
  const networks = useRecoilValue(connectionState);

  return (
    <Card>
      <div className="mb-2 text-2xl font-light">{wallet.name}</div>

      {Object.values(networks).map((network) => (
        <NetworkBalances
          key={network.network.chainId}
          wallet={wallet}
          connection={network}
        />
      ))}
    </Card>
  );
};

export default AccountBalances;
