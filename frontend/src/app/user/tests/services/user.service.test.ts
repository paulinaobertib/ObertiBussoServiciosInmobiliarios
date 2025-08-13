import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getMe,
  getRoles,
  postUser,
  getUserById,
  getTenants,
  getAllUsers,
  searchUsersByText,
  userExists,
  putUser,
  addRoleToUser,
  deleteUser,
  deleteRoleFromUser,
} from '../../services/user.service';

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

describe('user.service', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
    logSpy.mockRestore();
  });

  it('getMe: GET /users/user/me con withCredentials; retorna response completo', async () => {
    (api.get as any).mockResolvedValueOnce(resp({ id: 'u1' }));

    const r = await getMe();

    expect(api.get).toHaveBeenCalledWith('/users/user/me', { withCredentials: true });
    expect(r).toEqual(resp({ id: 'u1' }));
  });

  it('getMe: error -> re-lanza y loguea', async () => {
    const err = new Error('me fail');
    (api.get as any).mockRejectedValueOnce(err);

    await expect(getMe()).rejects.toThrow('me fail');
    expect(errorSpy).toHaveBeenCalledWith('Error fetching me:', err);
  });

  it('getRoles: GET /users/user/role/{id}; retorna response completo', async () => {
    (api.get as any).mockResolvedValueOnce(resp(['TENANT']));

    const r = await getRoles('u1');

    expect(api.get).toHaveBeenCalledWith('/users/user/role/u1', { withCredentials: true });
    expect(r).toEqual(resp(['TENANT']));
  });

  it('getRoles: error -> re-lanza y loguea', async () => {
    const err = new Error('roles fail');
    (api.get as any).mockRejectedValueOnce(err);

    await expect(getRoles('u1')).rejects.toThrow('roles fail');
    expect(errorSpy).toHaveBeenCalledWith('Error fetching roles:', err);
  });

  it('postUser: POST /users/user/create con body en params y body null; retorna data', async () => {
    const body = { username: 'vicky', email: 'v@x.com', password: 'secret' };
    (api.post as any).mockResolvedValueOnce(resp({ id: 'u1' }));

    const r = await postUser(body as any);

    expect(api.post).toHaveBeenCalledWith(
      '/users/user/create',
      null,
      { params: body, withCredentials: true }
    );
    expect(r).toEqual({ id: 'u1' });
  });

  it('postUser: error -> re-lanza y loguea', async () => {
    const err = new Error('create user fail');
    (api.post as any).mockRejectedValueOnce(err);

    await expect(postUser({} as any)).rejects.toThrow('create user fail');
    expect(errorSpy).toHaveBeenCalledWith('Error creating user:', err);
  });

  it('getUserById: GET /users/user/getById/{id}; retorna response completo', async () => {
    (api.get as any).mockResolvedValueOnce(resp({ id: 'u1' }));

    const r = await getUserById('u1');

    expect(api.get).toHaveBeenCalledWith('/users/user/getById/u1', { withCredentials: true });
    expect(r).toEqual(resp({ id: 'u1' }));
  });

  it('getUserById: error -> re-lanza y loguea', async () => {
    const err = new Error('by id fail');
    (api.get as any).mockRejectedValueOnce(err);

    await expect(getUserById('x')).rejects.toThrow('by id fail');
    expect(errorSpy).toHaveBeenCalledWith('Error fetching user by id:', err);
  });

  it('getTenants: GET /users/user/getTenants; retorna response completo', async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: 't1' }]));

    const r = await getTenants();

    expect(api.get).toHaveBeenCalledWith('/users/user/getTenants', { withCredentials: true });
    expect(r).toEqual(resp([{ id: 't1' }]));
  });

  it('getTenants: error -> re-lanza y loguea', async () => {
    const err = new Error('tenants fail');
    (api.get as any).mockRejectedValueOnce(err);

    await expect(getTenants()).rejects.toThrow('tenants fail');
    expect(errorSpy).toHaveBeenCalledWith('Error fetching tenants:', err);
  });

  it('getAllUsers: GET /users/user/getAll; retorna response completo', async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: 'u1' }]));

    const r = await getAllUsers();

    expect(api.get).toHaveBeenCalledWith('/users/user/getAll', { withCredentials: true });
    expect(r).toEqual(resp([{ id: 'u1' }]));
  });

  it('getAllUsers: error -> re-lanza y loguea', async () => {
    const err = new Error('all users fail');
    (api.get as any).mockRejectedValueOnce(err);

    await expect(getAllUsers()).rejects.toThrow('all users fail');
    expect(errorSpy).toHaveBeenCalledWith('Error fetching users:', err);
  });

  it('searchUsersByText: GET /users/user/findUser con params {searchTerm}; retorna data.data', async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: 'u1' }, { id: 'u2' }]));

    const r = await searchUsersByText('vi');

    expect(api.get).toHaveBeenCalledWith(
      '/users/user/findUser',
      { params: { searchTerm: 'vi' }, withCredentials: true }
    );
    expect(r).toEqual([{ id: 'u1' }, { id: 'u2' }]);
  });

  it('searchUsersByText: 404 retorna [] sin throw', async () => {
    const notFoundErr: any = new Error('not found');
    notFoundErr.response = { status: 404 };
    (api.get as any).mockRejectedValueOnce(notFoundErr);

    const r = await searchUsersByText('zzz');

    expect(r).toEqual([]);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('searchUsersByText: error no-404 -> re-lanza y loguea', async () => {
    const serverErr: any = new Error('search fail');
    serverErr.response = { status: 500 };
    (api.get as any).mockRejectedValueOnce(serverErr);

    await expect(searchUsersByText('vi')).rejects.toThrow('search fail');
    expect(errorSpy).toHaveBeenCalledWith('Error searching users:', serverErr);
  });

  it('userExists: GET /users/user/exist/{id}; retorna boolean (data)', async () => {
    (api.get as any).mockResolvedValueOnce(resp(true));

    const r = await userExists('u1');

    expect(api.get).toHaveBeenCalledWith('/users/user/exist/u1');
    expect(r).toBe(true);
  });

  it('userExists: error -> re-lanza y loguea', async () => {
    const err = new Error('exist fail');
    (api.get as any).mockRejectedValueOnce(err);

    await expect(userExists('u1')).rejects.toThrow('exist fail');
    expect(errorSpy).toHaveBeenCalledWith('Error checking user existence:', err);
  });

  it('putUser: PUT /users/user/update con body y withCredentials; retorna data y hace console.log(data)', async () => {
    const body = { id: 'u1', username: 'v', email: 'v@x.com' };
    (api.put as any).mockResolvedValueOnce(resp({ ok: true }));

    const r = await putUser(body as any);

    expect(api.put).toHaveBeenCalledWith('/users/user/update', body, { withCredentials: true });
    expect(r).toEqual({ ok: true });
    expect(logSpy).toHaveBeenCalledWith({ ok: true });
  });

  it('putUser: error -> re-lanza y loguea', async () => {
    const err = new Error('update fail');
    (api.put as any).mockRejectedValueOnce(err);

    await expect(putUser({} as any)).rejects.toThrow('update fail');
    expect(errorSpy).toHaveBeenCalledWith('Error updating user:', err);
  });

  it('addRoleToUser: PUT /users/user/update/role/{id}?role=... con body null y withCredentials; retorna data', async () => {
    (api.put as any).mockResolvedValueOnce(resp(['TENANT', 'ADMIN']));

    const r = await addRoleToUser('u1', 'ADMIN');

    expect(api.put).toHaveBeenCalledWith(
      '/users/user/update/role/u1',
      null,
      { params: { role: 'ADMIN' }, withCredentials: true }
    );
    expect(r).toEqual(['TENANT', 'ADMIN']);
  });

  it('addRoleToUser: error -> re-lanza y loguea', async () => {
    const err = new Error('add role fail');
    (api.put as any).mockRejectedValueOnce(err);

    await expect(addRoleToUser('u1', 'X')).rejects.toThrow('add role fail');
    expect(errorSpy).toHaveBeenCalledWith('Error adding role:', err);
  });

  it('deleteUser: DELETE /users/user/delete/{id} con withCredentials; retorna data', async () => {
    (api.delete as any).mockResolvedValueOnce(resp('ok'));

    const r = await deleteUser('u1');

    expect(api.delete).toHaveBeenCalledWith('/users/user/delete/u1', { withCredentials: true });
    expect(r).toBe('ok');
  });

  it('deleteUser: error -> re-lanza y loguea', async () => {
    const err = new Error('delete fail');
    (api.delete as any).mockRejectedValueOnce(err);

    await expect(deleteUser('u1')).rejects.toThrow('delete fail');
    expect(errorSpy).toHaveBeenCalledWith('Error deleting user:', err);
  });

  it('deleteRoleFromUser: DELETE /users/user/delete/role/{id}?role=... con withCredentials; retorna data', async () => {
    (api.delete as any).mockResolvedValueOnce(resp({ ok: true }));

    const r = await deleteRoleFromUser('u1', 'TENANT');

    expect(api.delete).toHaveBeenCalledWith(
      '/users/user/delete/role/u1',
      { params: { role: 'TENANT' }, withCredentials: true }
    );
    expect(r).toEqual({ ok: true });
  });

  it('deleteRoleFromUser: error -> re-lanza y loguea', async () => {
    const err = new Error('delete role fail');
    (api.delete as any).mockRejectedValueOnce(err);

    await expect(deleteRoleFromUser('u1', 'TENANT')).rejects.toThrow('delete role fail');
    expect(errorSpy).toHaveBeenCalledWith('Error deleting role:', err);
  });
});
