import React, { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { formatBalance } from '@polkadot/util';
import '@polkadot/api-augment';
import { decodeAddress, encodeAddress } from '@polkadot/keyring';

import { Connection, connectionState } from '../../store/api';
import { Asset, Chain, Wallet, StatemineExtras, OrmlExtras } from '../../db/db';
import { validate } from '../../utils/dataValidation';
import Card from '../../ui/Card';
import Shimmer from '../../ui/Shimmer';

type Balance = {
  free: any;
  isValid: boolean;
};

type Props = {
  wallet: Wallet;
  connection: Connection;
};

const getRelaychain = (
  networks: Connection[],
  network: Chain
): Connection | null => {
  if (network.parentId) {
    const parent = networks.find((n) => n.network.chainId === network.parentId);
    if (parent) {
      return parent;
    }
  }

  return null;
};

const NetworkBalances: React.FC<Props> = ({
  wallet,
  connection: { api, network },
}: Props) => {
  const networks = useRecoilValue(connectionState);

  const [balances, setBalances] = useState<Record<string, Balance>>({});
  const [relayChain, setRelayChain] = useState<Connection | null>(null);

  useEffect(() => {
    setRelayChain(getRelaychain(Object.values(networks), network));
  }, [networks, network]);

  useEffect(() => {
    const updateBalance = (asset: Asset, balance: any) => {
      setBalances((b) => {
        return {
          ...b,
          [asset.assetId]: {
            free: formatBalance(balance, {
              withUnit: false,
              decimals: asset.precision,
            }),
            isValid: false,
          },
        };
      });
    };

    const validateAssetBalance = async (
      data: any,
      storageKey: string,
      asset: Asset
    ) => {
      if (relayChain) {
        console.log('validation started');
        const isValid = await validate(relayChain?.api, api, data, storageKey);
        console.log('validation finished', isValid);

        setBalances((b) => {
          return {
            ...b,
            [asset.assetId]: {
              ...b[asset.assetId],
              isValid,
            },
          };
        });
      } else {
        console.log('no relay chain');
        setBalances((b) => {
          return {
            ...b,
            [asset.assetId]: {
              ...b[asset.assetId],
              isValid: true,
            },
          };
        });
      }
    };

    const account =
      wallet.chainAccounts.find((a) => a.chainId === network.chainId) ||
      wallet.mainAccounts[0];

    const address =
      encodeAddress(decodeAddress(account.accountId), network.addressPrefix) ||
      '';

    network.assets.forEach((asset: Asset) => {
      if (!asset.type) {
        api.query.system.account(address, async (data) => {
          const {
            data: { free: currentFree },
          } = data;

          updateBalance(asset, currentFree);
          const storageKey = await api.query.system.account.key(address);
          validateAssetBalance(data, storageKey, asset);
        });
      }

      if (asset.type === 'statemine') {
        // eslint-disable-next-line prefer-destructuring
        const statemineAssetId = (asset?.typeExtras as StatemineExtras).assetId;
        api.query.assets.account(statemineAssetId, address, async (data) => {
          let currentFree = '0';

          if (!data.isNone) {
            currentFree = data.unwrap().balance.toString();
          }
          updateBalance(asset, currentFree);

          const storageKey = await api.query.assets.account.key(
            statemineAssetId,
            address
          );

          validateAssetBalance(data, storageKey, asset);
        });
      }

      if (asset.type === 'orml') {
        // eslint-disable-next-line prefer-destructuring
        const ormlAssetId = (asset?.typeExtras as OrmlExtras).currencyIdScale;
        api.query.tokens.accounts(address, ormlAssetId, async (data: any) => {
          const currentFree = data.free;

          updateBalance(asset, currentFree);

          const storageKey = await api.query.tokens.accounts.key(
            address,
            ormlAssetId
          );
          validateAssetBalance(data, storageKey, asset);
        });
      }
    });
  }, [wallet, api, network, relayChain]);

  return (
    <>
      <div className="mb-2 text-xs font-light flex items-center">
        <img
          className="w-5 mr-2 invert"
          src={network.icon}
          alt={network.name}
        />
        {network.name}
      </div>

      <Card>
        {network.assets.map((asset: Asset) => (
          <div
            key={asset.assetId}
            className="flex w-full items-center justify-between h-11"
          >
            <div className="font-normal text-xl flex items-center">
              <img
                className="w-7 h-7 invert mr-3"
                src={asset.icon || network.icon}
                alt={asset.symbol}
              />
              {asset.symbol}
            </div>
            <div className="font-normal text-xl">
              {!balances[asset.assetId]?.isValid ? (
                <div className="w-12">
                  <Shimmer />
                </div>
              ) : (
                <>{balances[asset.assetId]?.free}</>
              )}
            </div>
          </div>
        ))}
      </Card>
    </>
  );
};

export default NetworkBalances;
