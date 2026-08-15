import React from 'react';
import { renderHook } from '@testing-library/react';
import { useTickets } from '@/hooks/useTickets';

jest.mock('@/hooks/useTickets');

describe('useTickets hook (mock)', () => {
  test('should be callable', () => {
    // basic smoke: the hook module should import without runtime issues
    expect(typeof useTickets).toBe('function');
  });
});
