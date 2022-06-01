import React, { useCallback, useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { useHistory } from 'react-router';
import { renderRoutes } from 'react-router-config';
import { useLiveQuery } from 'dexie-react-hooks';
import MatrixProvider from './components/Providers/MatrixProvider';
import createRouter from '../common/utils/routing';
import SplashScreen from './components/SplashScreen';
import { Routes } from '../common/constants';
import { loadChainsList } from './api/chains';
import { db } from './db/db';
import { ActiveType, Chain } from './db/types';
import { createConnection } from './utils/networks';
import { Connection, connectionState } from './store/connections';
import { HexString } from '../common/types';
import './App.css';

const getNetworkMap = (networks: Chain[]): Record<HexString, Chain> =>
  networks.reduce((acc, network) => {
    acc[network.chainId] = network;

    return acc;
  }, {} as Record<HexString, Chain>);

const App: React.FC = () => {
  const history = useHistory();
  const router = createRouter();

  const [isLoaded, setIsLoaded] = useState(false);
  const setConnections = useSetRecoilState(connectionState);

  const networks = useLiveQuery(() => db.chains.toArray());

  const loadChains = useCallback(async () => {
    // TODO: Add possibility to update chains list
    if (!networks || isLoaded) return;

    const chains: Chain[] = await loadChainsList();
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

    const newConnections = (await Promise.all(requests)).reduce(
      (acc, connection) =>
        connection ? { ...acc, [connection.network.chainId]: connection } : acc,
      {} as Record<HexString, Connection>,
    );

    setConnections(newConnections);
    setIsLoaded(true);
  }, [networks, isLoaded, setConnections]);

  useEffect(() => {
    loadChains();
  }, [loadChains]);

  const handleAutoLoginFail = () => {
    history.push(Routes.LOGIN);
  };

  return (
    <MatrixProvider
      loader={<SplashScreen />}
      onAutoLoginFail={handleAutoLoginFail}
    >
      <div className="ribbon">
        This is internal build of Omni Enterprise application proof of concept
        demo. User Interface is not final
      </div>
      {renderRoutes(router)}
    </MatrixProvider>
  );
};

export default App;
