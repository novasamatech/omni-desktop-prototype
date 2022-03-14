import React, { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { formatBalance } from '@polkadot/util';
import { apiState } from '../../store/api';
import Address from '../../ui/Address';

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
  const networks = useRecoilValue(apiState);
  const [balances, setBalances] = useState<Record<string, Balance>>({});
  const [properties, setProperties] = useState<Record<string, Properties>>({});

  useEffect(() => {
    networks.forEach(async ({ api, network }) => {
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
    networks.forEach(async ({ api, network }) => {
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
    <>
      <h3 className="font-light text-base p-4">
        <Address address={address} />
      </h3>
      {networks.map(({ network }) => (
        <div key={network.name}>
          {network.name}: {balances[network.name]?.free}{' '}
          {properties[network.name]?.symbol}
        </div>
      ))}
    </>
  );
};

export default BalanceComponent;
