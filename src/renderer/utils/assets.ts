/* eslint-disable import/prefer-default-export */
import { BN, BN_TEN } from '@polkadot/util';
import { DEFAULT } from '../../common/constants';
import { Asset, AssetType, OrmlExtras, StatemineExtras } from '../db/db';

export const formatAmount = (amount: string, precision: number): string => {
  // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
  const isDecimalValue = amount.match(/^(\d+)\.(\d+)$/);
  const bnPrecision = new BN(precision);
  if (isDecimalValue) {
    const div = new BN(amount.replace(/\.\d*$/, ''));
    const modString = amount.replace(/^\d+\./, '').slice(0, precision);
    const mod = new BN(modString);

    return div
      .mul(BN_TEN.pow(bnPrecision))
      .add(mod.mul(BN_TEN.pow(new BN(precision - modString.length))))
      .toString();
  }

  return new BN(amount.replace(/[^\d]/g, ''))
    .mul(BN_TEN.pow(bnPrecision))
    .toString();
};

export const getAssetId = (asset: Asset) => {
  const assetId = {
    [AssetType.ORML]: () => (asset.typeExtras as OrmlExtras).currencyIdScale,
    [AssetType.STATEMINE]: () => (asset.typeExtras as StatemineExtras).assetId,
    [DEFAULT]: () => asset.assetId,
  };

  return assetId[asset.type || DEFAULT]();
};

export const getAssetById = (assets: Asset[], id: string): Asset | undefined =>
  assets.find((a) => {
    return getAssetId(a) === id;
  });
