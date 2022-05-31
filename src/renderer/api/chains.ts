/* eslint-disable import/prefer-default-export */

const CONFIG_API =
  'https://raw.githubusercontent.com/nova-wallet/nova-utils/master';

export async function loadChainsList() {
  const chains = await fetch(`${CONFIG_API}/chains/v3/chains_dev.json`);
  return chains.json();
}
