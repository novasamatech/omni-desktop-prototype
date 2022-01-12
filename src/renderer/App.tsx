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
        <div className="flex justify-center items-center fixed bottom-0 w-screen h-16 bg-red-100">
          Transactions: {transactionsAmount}
          <Link to="/busket">
            <button type="button">View</button>
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
          <Route path="/*" component={Main} />
        </Switch>
      </Router>
    </RecoilRoot>
  );
}
