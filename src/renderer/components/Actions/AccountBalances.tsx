import React, { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { formatBalance } from '@polkadot/util';
import '@polkadot/api-augment';
import { decodeAddress, encodeAddress } from '@polkadot/keyring';

import { connectionState } from '../../store/api';
import List from '../../ui/List';
import ListItem from '../../ui/ListItem';
import { Wallet } from '../../db/db';

type Balance = {
  free: any;
  nonce: any;
};

type Properties = {
  decimals?: number;
  symbol?: string;
};

type Props = {
  wallet: Wallet;
};

const BalanceComponent: React.FC<Props> = ({ wallet }: Props) => {
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
      const account =
        wallet.chainAccounts.find((a) => a.chainId === network.chainId) ||
        wallet.mainAccounts[0];

      const address =
        encodeAddress(
          decodeAddress(account.accountId),
          network.addressPrefix
        ) || '';
      const decimals = properties[network.name]?.decimals;

      api.query.system.account(
        address,
        ({ data: { free: currentFree }, nonce: currentNonce }) => {
          setBalances((b) => {
            return {
              ...b,
              [network.name]: {
                free: formatBalance(currentFree, {
                  withUnit: false,
                  decimals,
                }),
                nonce: formatBalance(currentNonce, {
                  withUnit: false,
                  decimals,
                }),
              },
            };
          });
        }
      );
    });
  }, [wallet, networks, properties]);

  return (
    <div>
      <div className="mt-2 mb-2">{wallet.name}</div>

      <List>
        {Object.values(networks).map(({ network }) => (
          <ListItem key={network.name}>
            <div className="flex w-full items-center justify-between">
              <div className="font-semibold">
                {properties[network.name]?.symbol}
              </div>
              <div className="font-semibold">
                {balances[network.name]?.free}
              </div>
            </div>
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default BalanceComponent;
