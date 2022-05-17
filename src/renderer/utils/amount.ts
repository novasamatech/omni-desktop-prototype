/* eslint-disable import/prefer-default-export */
import { BN, BN_TEN } from '@polkadot/util';

export const formatAmount = (amount: string, precision: number): string => {
  console.log(precision);
  // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
  const isDecimalValue = amount.match(/^(\d+)\.(\d+)$/);
  const bnPrecision = new BN(precision);
  let result;

  if (isDecimalValue) {
    const div = new BN(amount.replace(/\.\d*$/, ''));
    const modString = amount.replace(/^\d+\./, '').substr(0, precision);
    const mod = new BN(modString);

    result = div
      .mul(BN_TEN.pow(bnPrecision))
      .add(mod.mul(BN_TEN.pow(new BN(precision - modString.length))));
  } else {
    result = new BN(amount.replace(/[^\d]/g, '')).mul(BN_TEN.pow(bnPrecision));
  }
  console.log(result.toString());
  return result.toString();
};
