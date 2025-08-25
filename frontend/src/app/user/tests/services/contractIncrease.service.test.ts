import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  postContractIncrease,
  updateContractIncrease,
  deleteContractIncrease,
  getContractIncreaseById,
  getContractIncreasesByContract,
} from '../../services/contractIncrease.service';

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

describe('contractIncrease.service', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('postContractIncrease: POST /users/contractIncreases/create con body y withCredentials; retorna response.data', async () => {
    const body = { contractId: 10, percentage: 12.5, effectiveDate: '2025-09-01' };
    (api.post as any).mockResolvedValueOnce(resp({ id: 99 }));

    const r = await postContractIncrease(body as any);

    expect(api.post).toHaveBeenCalledWith(
      '/users/contractIncreases/create',
      body,
      { withCredentials: true }
    );
    expect(r).toEqual({ id: 99 });
  });

  it('postContractIncrease: re-lanza error y loguea', async () => {
    const err = new Error('create increase fail');
    (api.post as any).mockRejectedValueOnce(err);

    await expect(postContractIncrease({} as any)).rejects.toThrow('create increase fail');
    expect(errorSpy).toHaveBeenCalledWith('Error creating contract increase:', err);
  });

  it('updateContractIncrease: PUT /users/contractIncreases/update/{id} con body y withCredentials; retorna response.data', async () => {
    const body = { id: 7, contractId: 10, percentage: 15, effectiveDate: '2025-10-01' };
    (api.put as any).mockResolvedValueOnce(resp({ ok: true }));

    const r = await updateContractIncrease(body as any);

    expect(api.put).toHaveBeenCalledWith(
      '/users/contractIncreases/update/7',
      body,
      { withCredentials: true }
    );
    expect(r).toEqual({ ok: true });
  });

  it('updateContractIncrease: re-lanza error y loguea', async () => {
    const err = new Error('update increase fail');
    (api.put as any).mockRejectedValueOnce(err);

    await expect(updateContractIncrease({ id: 1 } as any)).rejects.toThrow('update increase fail');
    expect(errorSpy).toHaveBeenCalledWith('Error updating contract increase:', err);
  });

  it('deleteContractIncrease: DELETE /users/contractIncreases/delete/{id} con withCredentials; retorna response.data', async () => {
    const body = { id: 3, contractId: 10, percentage: 10, effectiveDate: '2025-01-01' };
    (api.delete as any).mockResolvedValueOnce(resp({ ok: true }));

    const r = await deleteContractIncrease(body as any);

    expect(api.delete).toHaveBeenCalledWith(
      '/users/contractIncreases/delete/3',
      { withCredentials: true }
    );
    expect(r).toEqual({ ok: true });
  });

  it('deleteContractIncrease: re-lanza error y loguea', async () => {
    const err = new Error('delete increase fail');
    (api.delete as any).mockRejectedValueOnce(err);

    await expect(deleteContractIncrease({ id: 99 } as any)).rejects.toThrow('delete increase fail');
    expect(errorSpy).toHaveBeenCalledWith('Error deleting contract increase:', err);
  });

  it('getContractIncreaseById: GET /users/contractIncreases/getById/{id}; retorna response.data', async () => {
    (api.get as any).mockResolvedValueOnce(resp({ id: 5 }));

    const r = await getContractIncreaseById(5);

    expect(api.get).toHaveBeenCalledWith(
      '/users/contractIncreases/getById/5',
      { withCredentials: true }
    );
    expect(r).toEqual({ id: 5 });
  });

  it('getContractIncreaseById: re-lanza error y loguea con ID', async () => {
    const err = new Error('not found');
    (api.get as any).mockRejectedValueOnce(err);

    await expect(getContractIncreaseById(404)).rejects.toThrow('not found');
    expect(errorSpy).toHaveBeenCalledWith(
      'Error fetching contract increase with ID 404:',
      err
    );
  });

  it('getContractIncreasesByContract: GET /users/contractIncreases/contract/{contractId}; retorna response.data', async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: 1 }, { id: 2 }]));

    const r = await getContractIncreasesByContract(777);

    expect(api.get).toHaveBeenCalledWith(
      '/users/contractIncreases/contract/777',
      { withCredentials: true }
    );
    expect(r).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it('getContractIncreasesByContract: re-lanza error y loguea con contractId', async () => {
    const err = new Error('contract increases fail');
    (api.get as any).mockRejectedValueOnce(err);

    await expect(getContractIncreasesByContract(2)).rejects.toThrow('contract increases fail');
    expect(errorSpy).toHaveBeenCalledWith(
      'Error fetching increases for contract 2:',
      err
    );
  });
});
