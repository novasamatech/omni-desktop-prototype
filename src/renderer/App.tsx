import { MemoryRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { RecoilRoot, useRecoilState, useRecoilValue } from 'recoil';
import { Detector } from '@substrate/connect';
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

const Main = () => {
  const [api, setApi] = useRecoilState(apiState);
  const { transactionsAmount } = useRecoilValue(transactionBusketDataState);

  const connect = async () => {
    const detect = new Detector('omni-enterprise');
    const apiObject = await detect.connect('westend');

    setApi(apiObject);
  };

  if (!api) {
    connect();
  }

  return (
    <div className="flex h-screen">
      <FirstColumn />
      <SecondColumn />
      <ThirdColumn />

      {!api && (
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
