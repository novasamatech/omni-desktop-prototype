import '@polkadot/api-augment';
import { StrictMode } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { render } from 'react-dom';
import { RecoilRoot } from 'recoil';
import App from './App';

render(
  <StrictMode>
    <Router>
      <RecoilRoot>
        <App />
      </RecoilRoot>
    </Router>
  </StrictMode>,
  document.getElementById('root'),
);
