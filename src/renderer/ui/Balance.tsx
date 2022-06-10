import React, { useCallback, useEffect, useState } from 'react';
import { FrameSystemAccountInfo } from '@polkadot/types/lookup';

import { Connection } from '../store/connections';
import {
  Asset,
  StatemineExtras,
  OrmlExtras,
  AssetType,
  Wallet,
} from '../db/types';
import Shimmer from './Shimmer';
import { formatBalance } from '../utils/assets';
import { getAddressFromWallet } from '../utils/account';

type Props = {
  asset: Asset;
  connection: Connection;
  wallet: Wallet;
};

const Balance: React.FC<Props> = ({
  asset,
  wallet,
  connection: { api, network },
}) => {
  const [balance, setBalance] = useState<string>();

  const updateBalance = useCallback(
    (newBalance: any) => {
      setBalance(formatBalance(newBalance.toString(), asset?.precision));
    },
    [asset],
  );

  const subscribeBalanceChange = useCallback(
    (address: string) =>
      api.query.system.account(
        address,
        async (data: FrameSystemAccountInfo) => {
          const {
            data: { free, feeFrozen },
          } = data;
          updateBalance(free.sub(feeFrozen));
        },
      ),
    [api, updateBalance],
  );

  const subscribeStatemineAssetChange = useCallback(
    async (address: string) => {
      // eslint-disable-next-line prefer-destructuring
      const statemineAssetId = (asset?.typeExtras as StatemineExtras).assetId;
      return api.query.assets.account(
        statemineAssetId,
        address,
        async (data) => {
          let currentFree = '0';

          if (!data.isNone) {
            currentFree = data.unwrap().balance.toString();
          }
          updateBalance(currentFree);
        },
      );
    },
    [asset, api, updateBalance],
  );

  const subscribeOrmlAssetChange = useCallback(
    async (address: string) => {
      // eslint-disable-next-line prefer-destructuring
      const ormlAssetId = (asset?.typeExtras as OrmlExtras).currencyIdScale;
      return api.query.tokens.accounts(
        address,
        ormlAssetId,
        async (data: any) => {
          const currentFree = data.free.sub(data.frozen);
          updateBalance(currentFree);
        },
      );
    },
    [asset, api, updateBalance],
  );

  useEffect(() => {
    if (wallet) {
      const address = getAddressFromWallet(wallet, network);

      // TODO: Unsubscribe from subscriptions
      if (!asset.type) {
        subscribeBalanceChange(address);
      }

      if (asset.type === AssetType.STATEMINE) {
        subscribeStatemineAssetChange(address);
      }

      if (asset.type === AssetType.ORML) {
        subscribeOrmlAssetChange(address);
      }
    }
  }, [
    wallet,
    asset,
    network,
    subscribeBalanceChange,
    subscribeStatemineAssetChange,
    subscribeOrmlAssetChange,
  ]);

  if (!asset || !wallet) return <Shimmer width="80px" height="20px" />;

  return (
    <span>
      {balance} {asset.symbol}
    </span>
  );
};

export default Balance;
