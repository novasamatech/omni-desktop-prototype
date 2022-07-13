import React, { ChangeEvent } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useRecoilState } from 'recoil';
import { ActiveType, Chain } from '../../db/types';
import { db } from '../../db/db';
import List from '../../ui/List';
import ListItem from '../../ui/ListItem';
import Dropdown from '../../ui/Dropdown';
import { connectionState } from '../../store/connections';
import { createConnection } from '../../utils/networks';

const NETWORK_OPTIONS = [
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
];

const NetworkList: React.FC = () => {
  const [connections, setConnections] = useRecoilState(connectionState);

  const networks = useLiveQuery(() => db.chains.toArray());

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

  const onNetworkChange =
    (id?: number) => async (event: ChangeEvent<HTMLSelectElement>) => {
      if (!id) return;

      await db.chains.update(id, {
        activeType: event.target.value,
      });

      const network = await db.chains.get(id);
      if (!network) return;

      disableNetwork(network);

      const api = await createConnection(network);
      if (!api) return;

      setConnections((prev) => ({
        ...prev,
        [network.chainId]: { network, api },
      }));
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
                options={NETWORK_OPTIONS}
                value={network.activeType || ActiveType.DISABLED}
                onChange={onNetworkChange(network.id)}
              />
            </ListItem>
          ))}
        </List>
      </div>
    </>
  );
};

export default NetworkList;
