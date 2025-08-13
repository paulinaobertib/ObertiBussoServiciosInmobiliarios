import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  postPayment,
  putPayment,
  deletePayment,
  getPaymentById,
  getPaymentsByContractId,
  getPaymentsByDate,
  getPaymentsByDateBetween,
} from '../../services/payment.service';

vi.mock('../../../../api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import { api } from '../../../../api';

const resp = (data: any) => ({ data });

describe('payment.service', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('postPayment: POST /users/payments/create con body y withCredentials; retorna response.data', async () => {
    const body = { contractId: 10, amount: 1234, currency: 'USD', date: '2025-08-01' };
    (api.post as any).mockResolvedValueOnce(resp({ id: 99 }));

    const r = await postPayment(body as any);

    expect(api.post).toHaveBeenCalledWith(
      '/users/payments/create',
      body,
      { withCredentials: true }
    );
    expect(r).toEqual({ id: 99 });
  });

  it('postPayment: re-lanza error y loguea', async () => {
    const err = new Error('create payment fail');
    (api.post as any).mockRejectedValueOnce(err);

    await expect(postPayment({} as any)).rejects.toThrow('create payment fail');
    expect(errorSpy).toHaveBeenCalledWith('Error creating payment:', err);
  });

  it('putPayment: PUT /users/payments/update con body y withCredentials; retorna response.data', async () => {
    const body = { id: 5, amount: 1500, currency: 'ARS', date: '2025-08-02' };
    (api.put as any).mockResolvedValueOnce(resp({ ok: true }));

    const r = await putPayment(body as any);

    expect(api.put).toHaveBeenCalledWith(
      '/users/payments/update',
      body,
      { withCredentials: true }
    );
    expect(r).toEqual({ ok: true });
  });

  it('putPayment: re-lanza error y loguea', async () => {
    const err = new Error('update payment fail');
    (api.put as any).mockRejectedValueOnce(err);

    await expect(putPayment({} as any)).rejects.toThrow('update payment fail');
    expect(errorSpy).toHaveBeenCalledWith('Error updating payment:', err);
  });

  it('deletePayment: DELETE /users/payments/delete/{id}; retorna response.data', async () => {
    (api.delete as any).mockResolvedValueOnce(resp({ ok: true }));

    const r = await deletePayment({ id: 7 } as any);

    expect(api.delete).toHaveBeenCalledWith(
      '/users/payments/delete/7',
      { withCredentials: true }
    );
    expect(r).toEqual({ ok: true });
  });

  it('deletePayment: re-lanza error y loguea', async () => {
    const err = new Error('delete payment fail');
    (api.delete as any).mockRejectedValueOnce(err);

    await expect(deletePayment({ id: 9 } as any)).rejects.toThrow('delete payment fail');
    expect(errorSpy).toHaveBeenCalledWith('Error deleting payment:', err);
  });

  // ------------------- GETs -------------------

  it('getPaymentById: GET /users/payments/getById/{id}; retorna response.data', async () => {
    (api.get as any).mockResolvedValueOnce(resp({ id: 3 }));

    const r = await getPaymentById(3);

    expect(api.get).toHaveBeenCalledWith(
      '/users/payments/getById/3',
      { withCredentials: true }
    );
    expect(r).toEqual({ id: 3 });
  });

  it('getPaymentById: re-lanza error y loguea con ID', async () => {
    const err = new Error('not found');
    (api.get as any).mockRejectedValueOnce(err);

    await expect(getPaymentById(404)).rejects.toThrow('not found');
    expect(errorSpy).toHaveBeenCalledWith('Error fetching payment with ID 404:', err);
  });

  it('getPaymentsByContractId: GET /users/payments/contract/{contractId}; retorna response.data', async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: 'p1' }]));

    const r = await getPaymentsByContractId(777);

    expect(api.get).toHaveBeenCalledWith(
      '/users/payments/contract/777',
      { withCredentials: true }
    );
    expect(r).toEqual([{ id: 'p1' }]);
  });

  it('getPaymentsByContractId: re-lanza error y loguea con contractId', async () => {
    const err = new Error('contract payments fail');
    (api.get as any).mockRejectedValueOnce(err);

    await expect(getPaymentsByContractId(2)).rejects.toThrow('contract payments fail');
    expect(errorSpy).toHaveBeenCalledWith('Error fetching payments for contract 2:', err);
  });

  it('getPaymentsByDate: GET /users/payments/getByDate con params {contractId,date}; retorna response.data', async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: 'd1' }]));

    const r = await getPaymentsByDate(3, '2025-08-01');

    expect(api.get).toHaveBeenCalledWith(
      '/users/payments/getByDate',
      { params: { contractId: 3, date: '2025-08-01' }, withCredentials: true }
    );
    expect(r).toEqual([{ id: 'd1' }]);
  });

  it('getPaymentsByDate: re-lanza error y loguea', async () => {
    const err = new Error('by date fail');
    (api.get as any).mockRejectedValueOnce(err);

    await expect(getPaymentsByDate(1, '2025-01-01')).rejects.toThrow('by date fail');
    expect(errorSpy).toHaveBeenCalledWith('Error fetching payments by date:', err);
  });

  it('getPaymentsByDateBetween: GET /users/payments/getByDateBetween con params {contractId,start,end}; retorna response.data', async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: 'r1' }, { id: 'r2' }]));

    const r = await getPaymentsByDateBetween(5, '2025-08-01', '2025-08-31');

    expect(api.get).toHaveBeenCalledWith(
      '/users/payments/getByDateBetween',
      { params: { contractId: 5, start: '2025-08-01', end: '2025-08-31' }, withCredentials: true }
    );
    expect(r).toEqual([{ id: 'r1' }, { id: 'r2' }]);
  });

  it('getPaymentsByDateBetween: re-lanza error y loguea', async () => {
    const err = new Error('range fail');
    (api.get as any).mockRejectedValueOnce(err);

    await expect(getPaymentsByDateBetween(5, 'a', 'b')).rejects.toThrow('range fail');
    expect(errorSpy).toHaveBeenCalledWith('Error fetching payments by date range:', err);
  });
});
