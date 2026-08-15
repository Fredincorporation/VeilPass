import { formatEth, ethToUsd, getDualCurrency } from '@/lib/currency-utils';

describe('currency-utils', () => {
  test('formatEth formats numbers correctly', () => {
    expect(formatEth(1.23456)).toBe('1.2346 ETH');
    expect(formatEth('0')).toBe('0.0000 ETH');
  });

  test('getDualCurrency returns both representations', () => {
    const dual = getDualCurrency(2);
    expect(dual).toHaveProperty('eth');
    expect(dual).toHaveProperty('usd');
    expect(dual.raw).toBe(2);
  });
});
