import React, { useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useRecoilState } from 'recoil';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { ProviderInterface } from '@polkadot/rpc-provider/types';
import { ScProvider } from '@polkadot/rpc-provider/substrate-connect';

import { ActiveType, Chain, db } from '../../db/db';
import List from '../../ui/List';
import ListItem from '../../ui/ListItem';
import { loadChainsList } from '../../api/chains';
import Dropdown from '../../ui/Dropdown';
import { connectionState } from '../../store/api';
import { getChainSpec, getKnownChainId } from '../../../common/networks';

const NetworkList: React.FC = () => {
  const [connections, setConnections] = useRecoilState(connectionState);

  const networks = useLiveQuery(async () => {
    const networkList = await db.chains.toArray();

    return networkList;
  });

  useEffect(() => {
    const loadChains = async () => {
      // TODO: Add possibility to update chains list
      if (networks && networks.length === 0) {
        const chains = await loadChainsList();
        db.chains.bulkAdd(chains);
      }
    };

    loadChains();
  }, [networks]);

  const disableNetwork = async (network: Chain) => {
    const connection = connections[network.chainId];

    if (connection) {
      setConnections((prev) => {
        const { [network.chainId]: toRemove, ...newObject } = prev;
        return newObject;
      });

      if (connection.api.isConnected) {
        await connection.api.disconnect();
      }
    }
  };

  const handleNetworkTypeChange = async (value: string, network: Chain) => {
    disableNetwork(network);
    let provider: ProviderInterface | undefined;

    if (value === ActiveType.LOCAL_NODE) {
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
    } else if (value === ActiveType.EXTERNAL_NODE) {
      // TODO: Add possibility to select best node
      provider = new WsProvider(network.nodes[0].url);
    }

    if (provider) {
      ApiPromise.create({ provider })
        .then((api) => {
          setConnections((prev) => ({
            ...prev,
            [network.chainId]: { network, api, provider },
          }));

          return true;
        })
        .catch((e) => console.error(e));
    }
  };

  return (
    <>
      <h2 className="font-light text-xl p-4">List of networks</h2>
      <div className="m-2">
        <List>
          {networks?.map((network) => (
            <ListItem key={network.chainId}>
              <img
                className="w-6 mr-2 invert"
                src={network.icon}
                alt={network.name}
              />
              {network.name}
              <Dropdown
                className="w-40 ml-auto"
                options={[
                  {
                    label: 'Disabled',
                    value: ActiveType.DISABLED,
                  },
                  {
                    label: 'Local node',
                    value: ActiveType.LOCAL_NODE,
                  },
                  {
                    label: 'External node',
                    value: ActiveType.EXTERNAL_NODE,
                  },
                ]}
                value={network.activeType || ActiveType.DISABLED}
                onChange={(event: any) => {
                  if (network.id) {
                    db.chains.update(network.id, {
                      activeType: event.target.value,
                    });
                  }

                  handleNetworkTypeChange(event.target.value, network);
                }}
              />
            </ListItem>
          ))}
        </List>
      </div>
    </>
  );
};

export default NetworkList;
