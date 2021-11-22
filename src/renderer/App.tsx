import { MemoryRouter as Router, Switch, Route } from 'react-router-dom';
import { Detector } from '@substrate/connect';
import FirstColumn from './components/FirstColumn';
import SecondColumn from './components/SecondColumn';
import ThirdColumn from './components/ThirdColumn';
import './App.css';

const Hello = () => {
  const connect = async () => {
    const detect = new Detector('omni-enterprise');
    await detect.connect('westend');
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
