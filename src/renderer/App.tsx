import React, { useCallback, useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { useHistory } from 'react-router';
import { renderRoutes } from 'react-router-config';
import { useLiveQuery } from 'dexie-react-hooks';
import MatrixProvider from './components/Providers/MatrixProvider';
import createRouter from '../common/utils/routing';
import SplashScreen from './components/SplashScreen';
import { Routes } from '../common/constants';
import './App.css';
import { loadChainsList } from './api/chains';
import { db } from './db/db';
import { ActiveType, Chain } from './db/types';
import { createConnection } from './utils/networks';
import { connectionState } from './store/connections';

const App: React.FC = () => {
  const history = useHistory();
  const router = createRouter();
  const networks = useLiveQuery(() => db.chains.toArray());
  const [isLoaded, setIsLoaded] = useState(false);
  const setConnections = useSetRecoilState(connectionState);

  const loadChains = useCallback(async () => {
    // TODO: Add possibility to update chains list
    if (networks === undefined || isLoaded) return;

    const chains = await loadChainsList();
    chains.forEach(async (chain: Chain) => {
      const network = networks.find((n) => n.chainId === chain.chainId);

      if (network?.id) {
        if (network.activeType !== ActiveType.DISABLED) {
          const api = await createConnection(network);
          if (!api) return;

          setConnections((prev) => ({
            ...prev,
            [network.chainId]: { network, api },
          }));
        }
        // db.chains.update(existedChain?.id, chain);
      } else {
        db.chains.add(chain);
      }
    });

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
