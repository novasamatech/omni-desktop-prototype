/* eslint-disable import/prefer-default-export */
// import chains from './chainsList.json';

const CONFIG_API =
  'https://raw.githubusercontent.com/nova-wallet/nova-utils/master';

export async function loadChainsList() {
  const chains = await fetch(`${CONFIG_API}/chains/v2/chains_dev.json`);
  const chainsList = await chains.json();
  return chainsList;
}
