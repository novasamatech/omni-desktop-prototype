import React from 'react';
import { RecoilRoot } from 'recoil';
import { useHistory } from 'react-router';
import { renderRoutes } from 'react-router-config';
import MatrixProvider from './components/Providers/MatrixProvider';
import createRouter from '../common/utils/routing';
import SplashScreen from './components/SplashScreen';
import { Routes } from '../common/constants';
import './App.css';

const App: React.FC = () => {
  const history = useHistory();
  const router = createRouter();

  const handleAutoLoginFail = () => {
    history.push(Routes.LOGIN);
  };

  return (
    <RecoilRoot>
      <MatrixProvider
        loader={<SplashScreen />}
        onAutoLoginFail={handleAutoLoginFail}
      >
        {renderRoutes(router)}
      </MatrixProvider>
    </RecoilRoot>
  );
};

export default App;
