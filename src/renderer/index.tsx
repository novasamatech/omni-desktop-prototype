/* eslint-disable promise/always-return */
import '@polkadot/api-augment';
import { render } from 'react-dom';
import App from './App';

async function initialSetup(): Promise<void | Error> {
  try {
    await Olm.init({ locateFile: () => olmWasmPath });
    console.info('=== 🟢 Olm started 🟢 ===');
  } catch (error) {
    console.warn('=== 🔴 Olm failed 🔴 ===');
    throw error;
  }
}

initialSetup()
  .then(() => {
    render(<App />, document.getElementById('root'));
  })
  .catch((error) => {
    console.warn('Application failed to start due to - ', error);
  });
