import { MemoryRouter as Router, Switch, Route } from 'react-router-dom';
import { Detector } from '@substrate/connect';
import FirstColumn from './components/FirstColumn';
import SecondColumn from './components/SecondColumn';
import ThirdColumn from './components/ThirdColumn';
import './App.css';

const Hello = () => {
  const connect = async () => {
    const detect = new Detector('my cool unstoppable app');
    console.log(1);
    console.log(detect.hasExtension());
    const api = detect.connect('westend');
    console.log(2, api);
    api
      .then((...args) => {
        console.log(4);
        console.log(args);

        return null;
      })
      .catch(() => {});
    // const now = await api.query.timestamp.now()
    console.log(3);

    // console.log(now)
  };

  connect();

  return (
    <div className="flex h-screen">
      <FirstColumn />
      <SecondColumn />
      <ThirdColumn />
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Hello} />
      </Switch>
    </Router>
  );
}
