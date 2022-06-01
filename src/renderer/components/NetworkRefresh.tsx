import React, { useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { useLiveQuery } from 'dexie-react-hooks';
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
): ConnectionMap {
  return connections.reduce(
    (acc, connection) =>
      connection ? { ...acc, [connection.network.chainId]: connection } : acc,
    {} as Record<HexString, Connection>,
  );
}

async function getChainConnections(
  networks: Chain[] = [],
): Promise<ConnectionMap> {
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
  const [isLoaded, setIsLoaded] = useState(false);
  const setConnections = useSetRecoilState(connectionState);

  const networks = useLiveQuery(() => db.chains.toArray()) || [];

  useEffect(() => {
    if (!networks.length || isLoaded) return;

    getChainConnections(networks)
      .then((connections) => {
        // eslint-disable-next-line promise/always-return
        if (!connections) return;

        setConnections(connections);
        setIsLoaded(true);
      })
      .catch(console.warn);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networks.length, isLoaded]);

  return null;
};

export default NetworkRefresh;
