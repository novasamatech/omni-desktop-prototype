import { MemoryRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { RecoilRoot, useRecoilState, useRecoilValue } from 'recoil';
import { ApiPromise } from '@polkadot/api';
import { createPolkadotJsScClient } from '@substrate/connect';
import FirstColumn from './components/FirstColumn';
import SecondColumn from './components/SecondColumn';
import ThirdColumn from './components/ThirdColumn';
import Busket from './components/Busket';
import { apiState } from './store/api';
import { transactionBusketDataState } from './store/transactionBusket';
import './App.css';
import Button from './ui/Button';
import ShowCode from './components/ShowCode';
import ScanCode from './components/ScanCode';
import { Network, Connection } from '../common/types';
import Networks from '../common/networks';

const Main = () => {
  const [api, setApi] = useRecoilState(apiState);
  const { transactionsAmount } = useRecoilValue(transactionBusketDataState);

  const connectToParachain = async (
    network: Network,
    relay: Network
  ): Promise<Connection> => {
    const scClient = createPolkadotJsScClient();
    await scClient.addWellKnownChain(relay.chainName);
    console.log(network.name);
    const provider = await scClient.addChain(network.chainSpec || '');

    const apiObject = await ApiPromise.create({ provider });

    return {
      network,
      provider,
      api: apiObject,
    };
  };

  const connectToNetwork = async (network: Network): Promise<Connection[]> => {
    const scClient = createPolkadotJsScClient();
    const provider = await scClient.addWellKnownChain(network.chainName);

    const apiObject = await ApiPromise.create({ provider });

    if (network.parachains) {
      const parachains = await Promise.all(
        network.parachains.map((parachain) =>
          connectToParachain(parachain, network)
        )
      );

      return [
        {
          network,
          provider,
          api: apiObject,
        },
        ...parachains,
      ];
    }

    return [
      {
        network,
        provider,
        api: apiObject,
      },
    ];
  };

  const connect = async () => {
    const apiObjects = await Promise.all(
      Networks.map((network) => connectToNetwork(network))
    );

    setApi(apiObjects.flat());
  };

  if (api.length === 0) {
    connect();
  }

  return (
    <div className="flex h-screen">
      <FirstColumn />
      <SecondColumn />
      <ThirdColumn />

      {api.length === 0 && (
        <div className="flex justify-center items-center fixed bottom-0 w-screen h-16 bg-red-100">
          Connecting
        </div>
      )}

      {transactionsAmount > 0 && (
        <div className="flex justify-center items-center fixed bottom-0 w-screen h-20 bg-gray-100">
          <div className="mr-12 w-36">
            View your {transactionsAmount} pending MST
            {transactionsAmount > 1 ? 'operations' : 'operation'}:
          </div>
          <Link to="/busket">
            <Button fat>
              View {transactionsAmount > 1 ? 'operations' : 'operation'}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <RecoilRoot>
      <Router>
        <Switch>
          <Route path="/busket" component={Busket} />
          <Route path="/show-code" component={ShowCode} />
          <Route path="/scan-code" component={ScanCode} />
          <Route path="/*" component={Main} />
        </Switch>
      </Router>
    </RecoilRoot>
  );
}
