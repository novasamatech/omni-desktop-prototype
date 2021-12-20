import { MemoryRouter as Router } from 'react-router-dom';
import { RecoilRoot, useRecoilState } from 'recoil';
import { Detector } from '@substrate/connect';
import FirstColumn from './components/FirstColumn';
import SecondColumn from './components/SecondColumn';
import ThirdColumn from './components/ThirdColumn';
import './App.css';
import { apiState } from './store/Api';

const Main = () => {
  const [api, setApi] = useRecoilState(apiState);

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
    </div>
  );
};

export default function App() {
  return (
    <RecoilRoot>
      <Router>
        <Main />
      </Router>
    </RecoilRoot>
  );
}
