/* eslint-disable promise/catch-or-return,promise/always-return */
import React, { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { Connection, connectionState } from '../store/connections';
import { createConnection } from '../utils/networks';
import { HexString } from '../../common/types';
import { ActiveType, Chain } from '../db/types';
import { db } from '../db/db';

type ChainMap = Record<HexString, Chain>;
type ConnectionMap = Record<HexString, Connection>;

const CONFIG_API =
  'https://raw.githubusercontent.com/nova-wallet/nova-utils/master/chains/v3/chains_dev.json';

async function getChains(): Promise<Chain[]> {
  const chains = await fetch(CONFIG_API);
  return chains.json();
}

function getNetworkMap(networks: Chain[]): ChainMap {
  return networks.reduce((acc, network) => {
    acc[network.chainId] = network;

    return acc;
  }, {} as ChainMap);
}

function getConnectionMap(
  connections: (Connection | undefined)[],
): ConnectionMap | undefined {
  if (!connections.length) return undefined;

  return connections.reduce(
    (acc, connection) =>
      connection ? { ...acc, [connection.network.chainId]: connection } : acc,
    {} as Record<HexString, Connection>,
  );
}

async function getChainConnections(
  networks: Chain[] = [],
): Promise<ConnectionMap | undefined> {
  const chains = await getChains();
  const networkMap = getNetworkMap(networks);

  const requests = chains.reduce((acc, chain) => {
    const network = networkMap[chain.chainId];

    if (!network?.id) {
      db.chains.add(chain);
      return acc;
    }

    if (network.activeType === ActiveType.DISABLED) return acc;

    const connection = (async () => {
      const api = await createConnection(network);
      return api && { network, api };
    })();

    acc.push(connection);
    return acc;
  }, [] as Promise<Connection | undefined>[]);

  return getConnectionMap(await Promise.all(requests));
}

const NetworkRefresh: React.FC = () => {
  const setConnections = useSetRecoilState(connectionState);

  useEffect(() => {
    const setupConnections = async () => {
      const networks = await db.chains.toArray();
      const connections = await getChainConnections(networks);
      if (!connections) return;
      setConnections(connections);
    };

    setupConnections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default NetworkRefresh;
