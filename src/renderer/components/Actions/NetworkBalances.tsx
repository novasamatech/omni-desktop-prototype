import React, { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { Connection, connectionState } from '../../store/connections';
import { Asset, Chain, Wallet, Account } from '../../db/types';
import Card from '../../ui/Card';
import AssetBalance from './AssetBalance';
import Explorer from '../../ui/Explorer';
import { getAddressFromWallet } from '../../utils/account';

type Props = {
  wallet: Wallet;
  connection: Connection;
};

const getRelayChain = (
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
    setRelayChain(getRelayChain(Object.values(networks), network));
  }, [networks, network]);

  useEffect(() => {
    setAccount(
      wallet.chainAccounts.find((a) => a.chainId === network.chainId) ||
        wallet.mainAccounts[0],
    );
  }, [wallet, network]);

  return (
    <>
      <div className="flex justify-between">
        <div className="mb-2 text-xs font-light flex items-center">
          <img
            className="w-5 mr-2 invert"
            src={network.icon}
            alt={network.name}
          />
          {network.name}
        </div>
        <Explorer
          param={getAddressFromWallet(wallet, network)}
          type="account"
          network={network}
        />
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
