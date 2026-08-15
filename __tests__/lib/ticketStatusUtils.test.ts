import { determineTicketStatus, batchDetermineTicketStatus } from '@/lib/ticketStatusUtils';

describe('ticketStatusUtils', () => {
  test('determineTicketStatus returns upcoming for future dates', () => {
    const future = new Date();
    future.setDate(future.getDate() + 2);
    expect(determineTicketStatus(future.toISOString())).toBe('upcoming');
  });

  test('batchDetermineTicketStatus updates status for array', () => {
    const tickets = [{ event_date: new Date().toISOString() }];
    const res = batchDetermineTicketStatus(tickets);
    expect(res.length).toBe(1);
    expect(res[0]).toHaveProperty('status');
  });
});
