import React, { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import '@polkadot/api-augment';

import { Connection, connectionState } from '../../store/api';
import { Asset, Chain, Wallet, Account } from '../../db/db';
import Card from '../../ui/Card';
import AssetBalance from './AssetBalance';

type Props = {
  wallet: Wallet;
  connection: Connection;
};

const getRelaychain = (
  networks: Connection[],
  network: Chain,
): Connection | undefined => {
  if (!network.parentId) {
    return undefined;
  }

  return networks.find((n) => n.network.chainId === network.parentId);
};

const NetworkBalances: React.FC<Props> = ({ wallet, connection }: Props) => {
  const networks = useRecoilValue(connectionState);
  const { network } = connection;

  const [relayChain, setRelayChain] = useState<Connection>();
  const [account, setAccount] = useState<Account>();

  useEffect(() => {
    setRelayChain(getRelaychain(Object.values(networks), network));
  }, [networks, network]);

  useEffect(() => {
    setAccount(
      wallet.chainAccounts.find((a) => a.chainId === network.chainId) ||
        wallet.mainAccounts[0],
    );
  }, [wallet, network]);

  return (
    <>
      <div className="mb-2 text-xs font-light flex items-center">
        <img
          className="w-5 mr-2 invert"
          src={network.icon}
          alt={network.name}
        />
        {network.name}
      </div>

      <Card>
        {account
          ? network.assets.map((asset: Asset) => (
              <AssetBalance
                key={asset.assetId}
                asset={asset}
                account={account}
                connection={connection}
                relayChain={relayChain}
              />
            ))
          : "This wallet doesn't have an account for this network"}
      </Card>
    </>
  );
};

export default NetworkBalances;
