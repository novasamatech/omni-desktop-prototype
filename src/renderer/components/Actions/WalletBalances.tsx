import React from 'react';
import { useRecoilValue } from 'recoil';
import '@polkadot/api-augment';
import { useLiveQuery } from 'dexie-react-hooks';

import { connectionState } from '../../store/api';
import { db, Wallet } from '../../db/db';
import Card from '../../ui/Card';
import NetworkBalances from './NetworkBalances';

type Props = {
  wallet: Wallet;
};

const WalletBalances: React.FC<Props> = ({ wallet }: Props) => {
  const networks = useRecoilValue(connectionState);
  const walletFromDb = useLiveQuery(() => db.wallets.get(Number(wallet.id)));

  return (
    <>
      {walletFromDb && (
        <Card>
          <div className="mb-2 text-2xl font-light">{walletFromDb?.name}</div>

          {Object.values(networks).map((network) => (
            <NetworkBalances
              key={network.network.chainId}
              wallet={walletFromDb}
              connection={network}
            />
          ))}
        </Card>
      )}
    </>
  );
};

export default WalletBalances;
