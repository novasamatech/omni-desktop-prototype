import { formatBalance } from '../renderer/utils/assets';

describe('Format balance', () => {
  it('0.000000011676979', () => {
    expect(formatBalance('11676979', 15)).toBe('0.00000001');
  });
  it('0.000021676979', () => {
    expect(formatBalance('21676979', 12)).toBe('0.00002');
  });
  it('0.315000041811', () => {
    expect(formatBalance('315000041811', 12)).toBe('0.315');
  });
  it('0.99999999999', () => {
    expect(formatBalance('999999999999', 12)).toBe('0.99999');
  });
  it('999.99999999', () => {
    expect(formatBalance('999999999999', 9)).toBe('999.99');
  });
  it('888888.1234', () => {
    expect(formatBalance('8888881234', 4)).toBe('888,888.12');
  });
  it('1000000', () => {
    expect(formatBalance('1000000', 0)).toBe('1M');
  });
  it('1243000', () => {
    expect(formatBalance('1243000', 0)).toBe('1.24M');
  });
  it('1243011', () => {
    expect(formatBalance('1243011', 0)).toBe('1.24M');
  });
  it('100041000000', () => {
    expect(formatBalance('100041000000', 0)).toBe('100.04B');
  });
  it('1001000000000', () => {
    expect(formatBalance('1001000000000', 0)).toBe('1T');
  });
  it('1001000000000000', () => {
    expect(formatBalance('1001000000000000', 0)).toBe('1,001T');
  });
});
