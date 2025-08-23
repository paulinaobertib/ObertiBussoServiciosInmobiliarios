import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  postContract,
  putContract,
  patchContractStatus,
  deleteContract,
  getContractById,
  getAllContracts,
  getContractsByUserId,
  getContractsByPropertyId,
  getContractsByType,
  getContractsByStatus,
  getContractsByDateRange,
} from '../../services/contract.service';

vi.mock('../../../../api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { api } from '../../../../api';

const resp = (data: any) => ({ data });

describe('contract.service', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('postContract: POST a users/contracts/create con body, params y withCredentials; retorna response.data', async () => {
    const body = { propertyId: 1, userId: 'u1', type: 'RENT' };
    (api.post as any).mockResolvedValueOnce(resp({ id: 99 }));

    const r = await postContract(body as any, 1234, 'USD');

    expect(api.post).toHaveBeenCalledWith(
      'users/contracts/create',
      body,
      { params: { amount: 1234, currency: 'USD' }, withCredentials: true }
    );
    expect(r).toEqual({ id: 99 });
  });

  it('postContract: re-lanza error y loguea', async () => {
    const err = new Error('create fail');
    (api.post as any).mockRejectedValueOnce(err);

    await expect(postContract({} as any, 1, 'ARS')).rejects.toThrow('create fail');
    expect(errorSpy).toHaveBeenCalledWith('Error creating contract:', err);
  });

  it('putContract: PUT /users/contracts/update con body y withCredentials; retorna response.data', async () => {
    const body = { id: 10, propertyId: 1, userId: 'u1', status: 'ACTIVE' };
    (api.put as any).mockResolvedValueOnce(resp({ ok: true }));

    const r = await putContract(body as any);

    expect(api.put).toHaveBeenCalledWith(
      '/users/contracts/update',
      body,
      { withCredentials: true }
    );
    expect(r).toEqual({ ok: true });
  });

  it('putContract: re-lanza error y loguea', async () => {
    const boom = new Error('update fail');
    (api.put as any).mockRejectedValueOnce(boom);

    await expect(putContract({} as any)).rejects.toThrow('update fail');
    expect(errorSpy).toHaveBeenCalledWith('Error updating contract:', boom);
  });

  it('patchContractStatus: PATCH /users/contracts/updateStatus/{id} con null y withCredentials; retorna response.data', async () => {
    (api.patch as any).mockResolvedValueOnce(resp({ ok: true }));

    const r = await patchContractStatus(7);

    expect(api.patch).toHaveBeenCalledWith(
      '/users/contracts/updateStatus/7',
      null,
      { withCredentials: true }
    );
    expect(r).toEqual({ ok: true });
  });

  it('patchContractStatus: re-lanza error y loguea', async () => {
    const err = new Error('status fail');
    (api.patch as any).mockRejectedValueOnce(err);

    await expect(patchContractStatus(1)).rejects.toThrow('status fail');
    expect(errorSpy).toHaveBeenCalledWith('Error updating contract status:', err);
  });

  it('deleteContract: DELETE /users/contracts/delete/{id}; retorna response.data', async () => {
    (api.delete as any).mockResolvedValueOnce(resp({ ok: true }));

    const r = await deleteContract(33);

    expect(api.delete).toHaveBeenCalledWith(
      '/users/contracts/delete/33',
      { withCredentials: true }
    );
    expect(r).toEqual({ ok: true });
  });

  it('deleteContract: re-lanza error y loguea', async () => {
    const err = new Error('delete fail');
    (api.delete as any).mockRejectedValueOnce(err);

    await expect(deleteContract(9)).rejects.toThrow('delete fail');
    expect(errorSpy).toHaveBeenCalledWith('Error deleting contract:', err);
  });

  it('getContractById: GET /users/contracts/getById/{id}; retorna response.data', async () => {
    (api.get as any).mockResolvedValueOnce(resp({ id: 5 }));

    const r = await getContractById(5);

    expect(api.get).toHaveBeenCalledWith(
      '/users/contracts/getById/5',
      { withCredentials: true }
    );
    expect(r).toEqual({ id: 5 });
  });

  it('getContractById: re-lanza error y loguea con ID en el mensaje', async () => {
    const err = new Error('not found');
    (api.get as any).mockRejectedValueOnce(err);

    await expect(getContractById(404)).rejects.toThrow('not found');
    expect(errorSpy).toHaveBeenCalledWith(
      'Error fetching contract with ID 404:',
      err
    );
  });

  it('getAllContracts: GET /users/contracts/getAll; retorna response.data', async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: 1 }, { id: 2 }]));

    const r = await getAllContracts();

    expect(api.get).toHaveBeenCalledWith(
      '/users/contracts/getAll',
      { withCredentials: true }
    );
    expect(r).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it('getContractsByUserId: GET /users/contracts/user/{userId}; retorna response.data', async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: 'a' }]));

    const r = await getContractsByUserId('u1');

    expect(api.get).toHaveBeenCalledWith(
      '/users/contracts/user/u1',
      { withCredentials: true }
    );
    expect(r).toEqual([{ id: 'a' }]);
  });

  it('getContractsByUserId: re-lanza error y loguea con userId', async () => {
    const err = new Error('user fail');
    (api.get as any).mockRejectedValueOnce(err);

    await expect(getContractsByUserId('uX')).rejects.toThrow('user fail');
    expect(errorSpy).toHaveBeenCalledWith(
      'Error fetching contracts for user uX:',
      err
    );
  });

  it('getContractsByPropertyId: GET /users/contracts/property/{propertyId}', async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: 'p' }]));

    const r = await getContractsByPropertyId(777);

    expect(api.get).toHaveBeenCalledWith(
      '/users/contracts/property/777',
      { withCredentials: true }
    );
    expect(r).toEqual([{ id: 'p' }]);
  });

  it('getContractsByPropertyId: re-lanza error y loguea con propertyId', async () => {
    const err = new Error('prop fail');
    (api.get as any).mockRejectedValueOnce(err);

    await expect(getContractsByPropertyId(2)).rejects.toThrow('prop fail');
    expect(errorSpy).toHaveBeenCalledWith(
      'Error fetching contracts for property 2:',
      err
    );
  });

  it('getContractsByType: GET /users/contracts/type con params {type}', async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: 't' }]));

    const r = await getContractsByType('RENT' as any);

    expect(api.get).toHaveBeenCalledWith(
      '/users/contracts/type',
      { params: { type: 'RENT' }, withCredentials: true }
    );
    expect(r).toEqual([{ id: 't' }]);
  });

  it('getContractsByStatus: GET /users/contracts/status con params {status}', async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: 's' }]));

    const r = await getContractsByStatus('ACTIVE' as any);

    expect(api.get).toHaveBeenCalledWith(
      '/users/contracts/status',
      { params: { status: 'ACTIVE' }, withCredentials: true }
    );
    expect(r).toEqual([{ id: 's' }]);
  });

  it('getContractsByDateRange: GET /users/contracts/dateRange con params {start,end}', async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: 'd' }]));

    const r = await getContractsByDateRange('2025-01-01', '2025-01-31');

    expect(api.get).toHaveBeenCalledWith(
      '/users/contracts/dateRange',
      { params: { start: '2025-01-01', end: '2025-01-31' }, withCredentials: true }
    );
    expect(r).toEqual([{ id: 'd' }]);
  });

  it('getContractsByDateRange: re-lanza error y loguea', async () => {
    const err = new Error('range fail');
    (api.get as any).mockRejectedValueOnce(err);

    await expect(getContractsByDateRange('a', 'b')).rejects.toThrow('range fail');
    expect(errorSpy).toHaveBeenCalledWith('Error fetching contracts by date range:', err);
  });
});
