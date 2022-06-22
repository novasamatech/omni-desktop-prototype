import React from 'react';
import { useHistory } from 'react-router';
import { renderRoutes } from 'react-router-config';
import MatrixProvider from './components/Providers/MatrixProvider';
import createRouter from '../common/utils/routing';
import SplashScreen from './components/SplashScreen';
import { Routes } from '../common/constants';
import NetworkRefresh from './components/NetworkRefresh';
import './App.css';

const App: React.FC = () => {
  const history = useHistory();
  const router = createRouter();

  const handleAutoLoginFail = () => {
    history.push(Routes.LOGIN);
  };

  return (
    <>
      <NetworkRefresh />
      <MatrixProvider
        loader={<SplashScreen />}
        onAutoLoginFail={handleAutoLoginFail}
      >
        <div className="ribbon">
          This is internal build of Omni Enterprise application proof of concept
          demo. User Interface is not final (
          {process.env.VERSION?.toLowerCase()})
        </div>
        {renderRoutes(router)}
      </MatrixProvider>
    </>
  );
};

export default App;
