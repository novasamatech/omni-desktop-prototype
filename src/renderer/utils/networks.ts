import { ApiPromise, WsProvider } from '@polkadot/api';
import { ProviderInterface } from '@polkadot/rpc-provider/types';
import { ScProvider } from '@polkadot/rpc-provider/substrate-connect';
import { spec } from '@edgeware/node-types';
import { Chain, ActiveType } from '../db/types';
import { getKnownChainId, getChainSpec } from '../../common/networks';

export const createConnection = async (
  network: Chain,
): Promise<ApiPromise | undefined> => {
  let provider: ProviderInterface | undefined;

  if (network.activeType === ActiveType.LOCAL_NODE) {
    const chainId = getKnownChainId(network.name);

    if (chainId) {
      provider = new ScProvider(chainId);
      await provider.connect();
    } else {
      const chainSpec = getChainSpec(network.chainId);
      if (chainSpec) {
        provider = new ScProvider(chainSpec);
        await provider.connect();
      }
    }
  } else if (network.activeType === ActiveType.EXTERNAL_NODE) {
    // TODO: Add possibility to select best node
    provider = new WsProvider(network.nodes[0].url);
  }

  if (!provider) return;

  return ApiPromise.create({
    provider,
    typesBundle: {
      spec: {
        ...spec.typesBundle.spec,
      },
    },
  });
};

export default {};
