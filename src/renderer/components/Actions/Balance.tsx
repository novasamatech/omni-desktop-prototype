import React, { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { formatBalance } from '@polkadot/util';
import { connectionState } from '../../store/api';
import Address from '../../ui/Address';
import List from '../../ui/List';
import ListItem from '../../ui/ListItem';

type Balance = {
  free: any;
  nonce: any;
};

type Properties = {
  decimals?: number;
  symbol?: string;
};

type Props = {
  address: string;
};

const BalanceComponent: React.FC<Props> = ({ address }: Props) => {
  const networks = useRecoilValue(connectionState);
  const [balances, setBalances] = useState<Record<string, Balance>>({});
  const [properties, setProperties] = useState<Record<string, Properties>>({});

  useEffect(() => {
    Object.values(networks).forEach(async ({ api, network }) => {
      const chainProperties = await api.registry.getChainProperties();

      const decimals = chainProperties?.tokenDecimals.unwrap()[0].toNumber();
      const symbol = chainProperties?.tokenSymbol.unwrap()[0].toString();

      setProperties((p) => {
        return {
          ...p,
          [network.name]: {
            decimals,
            symbol,
          },
        };
      });
    });
  }, [networks]);

  useEffect(() => {
    Object.values(networks).forEach(async ({ api, network }) => {
      const account = await api.query.system.account(address);
      const decimals = properties[network.name]?.decimals;

      setBalances((b) => {
        return {
          ...b,
          [network.name]: {
            free: formatBalance(account.data.free, {
              withUnit: false,
              decimals,
            }),
            reserved: formatBalance(account.data.reserved, {
              withUnit: false,
              decimals,
            }),
            nonce: formatBalance(account.nonce, {
              withUnit: false,
              decimals,
            }),
          },
        };
      });
    });
  }, [address, networks, properties]);

  return (
    <div>
      <div className="mt-2 mb-2">
        <Address address={address} />
      </div>

      <List>
        {Object.values(networks).map(({ network }) => (
          <ListItem key={network.name}>
            {network.name}: {balances[network.name]?.free}{' '}
            {properties[network.name]?.symbol}
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default BalanceComponent;
