/* eslint-disable import/prefer-default-export */
import { BN, BN_TEN } from '@polkadot/util';

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
