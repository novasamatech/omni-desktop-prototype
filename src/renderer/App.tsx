// import { useEffect, useState } from 'react';
// import { useLiveQuery } from 'dexie-react-hooks';
import { MemoryRouter as Router, Route, Switch } from 'react-router-dom';
import { RecoilRoot, useRecoilValue } from 'recoil';
// import { ApiPromise, WsProvider } from '@polkadot/api';
// import { ProviderInterface } from '@polkadot/rpc-provider/types';
import React from 'react';
import FirstColumn from './components/FirstColumn';
import SecondColumn from './components/SecondColumn';
import ThirdColumn from './components/ThirdColumn';
import Busket from './components/Busket';
// import { connectionState } from './store/api';
import { transactionBusketDataState } from './store/transactionBusket';
import './App.css';
import ShowCode from './components/ShowCode';
import ScanCode from './components/ScanCode';
import LinkButton from './ui/LinkButton';
import { Routes } from '../common/consts';
import MatrixProvider from './modules/matrixProvider';
// import { ActiveType, db } from './db/db';
// import { getChainSpec, getKnownChainId } from '../common/networks';

const Main = () => {
  // TODO: Connect to the chain on app start

  // const [connections, setConnections] = useRecoilState(connectionState);
  // const [inited, setInited] = useState(false);

  const { transactionsAmount } = useRecoilValue(transactionBusketDataState);

  // const activeNetworks = useLiveQuery(() => {
  //   return db.chains
  //     .where('activeType')
  //     .anyOf(ActiveType.LOCAL_NODE, ActiveType.EXTERNAL_NODE)
  //     .toArray();
  // });

  // useEffect(() => {
  //   if (inited) {
  //     return;
  //   }

  //   activeNetworks?.forEach(async (n) => {
  //     let provider: ProviderInterface | undefined;

  //     if (n.activeType === ActiveType.LOCAL_NODE) {
  //       const scClient = createPolkadotJsScClient();

  //       const chainId = getKnownChainId(n.name);

  //       if (chainId) {
  //         provider = await scClient.addWellKnownChain(chainId);
  //       } else {
  //         const chainSpec = getChainSpec(n.chainId);
  //         if (chainSpec) {
  //           provider = await scClient.addChain(chainSpec);
  //         }
  //       }
  //     } else if (n.activeType === ActiveType.EXTERNAL_NODE) {
  //       provider = new WsProvider(n.nodes[0].url);
  //     }

  //     if (provider) {
  //       ApiPromise.create({ provider })
  //         .then((api) =>
  //           setConnections((prev) => ({
  //             ...prev,
  //             [n.chainId]: { network: n, api, provider },
  //           }))
  //         )
  //         .catch((e) => console.error(e));
  //     }
  //   });

  //   setInited(true);
  // }, [activeNetworks, connections, setConnections, inited]);

  return (
    <div className="flex h-screen">
      <FirstColumn />
      <SecondColumn />
      <ThirdColumn />

      {/* {api.length === 0 && (
        <div className="flex justify-center items-center fixed bottom-0 w-screen h-16 bg-red-100">
          Connecting
        </div>
      )} */}

      {transactionsAmount > 0 && (
        <div className="flex justify-center items-center fixed bottom-0 w-screen h-20 bg-gray-100">
          <div className="mr-12 w-36">
            View your {transactionsAmount} pending{' '}
            {transactionsAmount > 1 ? 'operations' : 'operation'}
          </div>
          <LinkButton to={Routes.BUSKET} size="lg">
            View {transactionsAmount > 1 ? 'operations' : 'operation'}
          </LinkButton>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <RecoilRoot>
      <MatrixProvider>
        <Router>
          <Switch>
            <Route path={Routes.BUSKET} component={Busket} />
            <Route path={Routes.SHOW_CODE} component={ShowCode} />
            <Route path={Routes.SCAN_CODE} component={ScanCode} />
            <Route path="/*" component={Main} />
          </Switch>
        </Router>
      </MatrixProvider>
    </RecoilRoot>
  );
};

export default App;
