import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createFavorite,
  getFavoritesByUser,
  deleteFavorite,
  getFavoritesByProperty,
} from '../../services/favorite.service';

vi.mock('../../../../api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

import { api } from '../../../../api';

const resp = (data: any) => ({ data });

describe('favorite.service', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('createFavorite: POST /users/favorites/create con body y withCredentials; retorna response (no .data)', async () => {
    (api.post as any).mockResolvedValueOnce(resp({ id: 123 }));

    const r = await createFavorite('u1', 77);

    expect(api.post).toHaveBeenCalledWith(
      '/users/favorites/create',
      { userId: 'u1', propertyId: 77 },
      { withCredentials: true }
    );
    expect(r).toEqual(resp({ id: 123 }));
  });

  it('createFavorite: re-lanza error y loguea', async () => {
    const err = new Error('create fail');
    (api.post as any).mockRejectedValueOnce(err);

    await expect(createFavorite('u1', 1)).rejects.toThrow('create fail');
    expect(errorSpy).toHaveBeenCalledWith('Error creating favorite:', err);
  });

  it('getFavoritesByUser: GET /users/favorites/user/{userId}; retorna response', async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: 'f1' }]));

    const r = await getFavoritesByUser('u1');

    expect(api.get).toHaveBeenCalledWith(
      '/users/favorites/user/u1',
      { withCredentials: true }
    );
    expect(r).toEqual(resp([{ id: 'f1' }]));
  });

  it('getFavoritesByUser: re-lanza error y loguea', async () => {
    const err = new Error('user fail');
    (api.get as any).mockRejectedValueOnce(err);

    await expect(getFavoritesByUser('uX')).rejects.toThrow('user fail');
    expect(errorSpy).toHaveBeenCalledWith('Error fetching favorites by user:', err);
  });

  it('deleteFavorite: DELETE /users/favorites/delete/{id}; retorna response', async () => {
    (api.delete as any).mockResolvedValueOnce(resp({ ok: true }));

    const r = await deleteFavorite(55);

    expect(api.delete).toHaveBeenCalledWith(
      '/users/favorites/delete/55',
      { withCredentials: true }
    );
    expect(r).toEqual(resp({ ok: true }));
  });

  it('deleteFavorite: re-lanza error y loguea', async () => {
    const err = new Error('delete fail');
    (api.delete as any).mockRejectedValueOnce(err);

    await expect(deleteFavorite(9)).rejects.toThrow('delete fail');
    expect(errorSpy).toHaveBeenCalledWith('Error deleting favorite:', err);
  });

  it('getFavoritesByProperty: GET /users/favorites/property/{propertyId}; retorna response', async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: 'f2' }]));

    const r = await getFavoritesByProperty(777);

    expect(api.get).toHaveBeenCalledWith(
      '/users/favorites/property/777',
      { withCredentials: true }
    );
    expect(r).toEqual(resp([{ id: 'f2' }]));
  });

  it('getFavoritesByProperty: re-lanza error y loguea', async () => {
    const err = new Error('prop fail');
    (api.get as any).mockRejectedValueOnce(err);

    await expect(getFavoritesByProperty(1)).rejects.toThrow('prop fail');
    expect(errorSpy).toHaveBeenCalledWith('Error fetching favorites by property:', err);
  });
});
