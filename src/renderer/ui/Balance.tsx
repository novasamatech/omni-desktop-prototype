import React, { useCallback, useEffect, useState } from 'react';
import { Connection } from '../store/connections';
import { Asset, AssetType, OrmlExtras, StatemineExtras } from '../db/types';
import Shimmer from './Shimmer';
import { formatBalance } from '../utils/assets';

type Props = {
  asset: Asset;
  connection: Connection;
  walletAddress: string;
};

const Balance: React.FC<Props> = ({
  asset,
  walletAddress,
  connection: { api, network },
}) => {
  const [balance, setBalance] = useState<string>();

  const updateBalance = useCallback(
    (newBalance) => {
      setBalance(formatBalance(newBalance.toString(), asset?.precision));
    },
    [asset],
  );

  const subscribeBalanceChange = useCallback(
    (address: string) => {
      return api.query.system.account(address, (data) => {
        const { free, feeFrozen } = data.data;
        updateBalance(free.sub(feeFrozen));
      });
    },
    [api, updateBalance],
  );

  const subscribeStatemineAssetChange = useCallback(
    (address: string) => {
      const statemineAssetId = (asset?.typeExtras as StatemineExtras).assetId;

      return api.query.assets.account(statemineAssetId, address, (data) => {
        const free = data.isNone ? '0' : data.unwrap().balance.toString();
        updateBalance(free);
      });
    },
    [asset, api, updateBalance],
  );

  const subscribeOrmlAssetChange = useCallback(
    async (address: string) => {
      const ormlAssetId = (asset?.typeExtras as OrmlExtras).currencyIdScale;

      return api.query.tokens.accounts(address, ormlAssetId, (data: any) => {
        const currentFree = data.free.sub(data.frozen);
        updateBalance(currentFree);
      });
    },
    [asset, api, updateBalance],
  );

  useEffect(() => {
    if (!walletAddress) return;

    let unsubBalance: any;
    let unsubStatemine: any;
    let unsubOrml: any;

    if (!asset.type) {
      unsubBalance = subscribeBalanceChange(walletAddress);
    }

    if (asset.type === AssetType.STATEMINE) {
      unsubStatemine = subscribeStatemineAssetChange(walletAddress);
    }

    if (asset.type === AssetType.ORML) {
      unsubOrml = subscribeOrmlAssetChange(walletAddress);
    }

    return () => {
      const logOk = () => console.info('unsub ok');
      const logFail = () => console.info('unsub fail');

      if (unsubBalance) unsubBalance.then(logOk).catch(logFail);
      if (unsubStatemine) unsubStatemine.then(logOk).catch(logFail);
      if (unsubOrml) unsubOrml.then(logOk).catch(logFail);
    };
  }, [
    walletAddress,
    asset,
    network,
    subscribeBalanceChange,
    subscribeStatemineAssetChange,
    subscribeOrmlAssetChange,
  ]);

  if (!asset || !walletAddress) return <Shimmer width="80px" height="20px" />;

  return (
    <span>
      {balance} {asset.symbol}
    </span>
  );
};

export default Balance;
