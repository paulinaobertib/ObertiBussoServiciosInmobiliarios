import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createAvailability,
  updateAvailability,
  deleteAvailability,
  getAvailabilityById,
  getAllAvailabilities,
  getAvailableAppointments,
  getUnavailableAppointments,
  createAppointment,
  deleteAppointment,
  updateAppointmentStatus,
  getAppointmentById,
  getAllAppointments,
  getAppointmentsByUser,
  getAppointmentsByStatus,
} from '../../services/appointment.service';

vi.mock('../../../../api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    put: vi.fn(),
  },
}));

import { api } from '../../../../api';

describe('appointments service', () => {
  const resp = (data: any) => ({ data });

  let errorSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    vi.clearAllMocks();
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('createAvailability: POST a /users/availableAppointments/create con body y withCredentials', async () => {
    const body = { from: '2025-08-10T10:00:00Z', to: '2025-08-10T11:00:00Z' };
    (api.post as any).mockResolvedValueOnce(resp({ ok: true }));

    const r = await createAvailability(body as any);
    expect(api.post).toHaveBeenCalledWith(
      '/users/availableAppointments/create',
      body,
      { withCredentials: true }
    );
    expect(r).toEqual(resp({ ok: true }));
  });

  it('createAvailability: re-lanza error y loguea mensaje', async () => {
    const boom = new Error('boom');
    (api.post as any).mockRejectedValueOnce(boom);

    await expect(createAvailability({} as any)).rejects.toThrow('boom');
    expect(errorSpy).toHaveBeenCalledWith(
      'Error creating availability:',
      boom
    );
  });

  it('updateAvailability: PATCH a /users/availableAppointments/updateAvailability/{id} con null y withCredentials', async () => {
    (api.patch as any).mockResolvedValueOnce(resp({ ok: true }));
    const r = await updateAvailability(123);
    expect(api.patch).toHaveBeenCalledWith(
      '/users/availableAppointments/updateAvailability/123',
      null,
      { withCredentials: true }
    );
    expect(r).toEqual(resp({ ok: true }));
  });

  it('deleteAvailability: DELETE a /users/availableAppointments/delete/{id}', async () => {
    (api.delete as any).mockResolvedValueOnce(resp({ ok: true }));
    const r = await deleteAvailability(55);
    expect(api.delete).toHaveBeenCalledWith(
      '/users/availableAppointments/delete/55',
      { withCredentials: true }
    );
    expect(r).toEqual(resp({ ok: true }));
  });

  it('getAvailabilityById: GET /users/availableAppointments/getById/{id}', async () => {
    (api.get as any).mockResolvedValueOnce(resp({ id: 7 }));
    const r = await getAvailabilityById(7);
    expect(api.get).toHaveBeenCalledWith(
      '/users/availableAppointments/getById/7',
      { withCredentials: true }
    );
    expect(r).toEqual(resp({ id: 7 }));
  });

  it('getAllAvailabilities: GET /users/availableAppointments/getAll', async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: 1 }]));
    const r = await getAllAvailabilities();
    expect(api.get).toHaveBeenCalledWith(
      '/users/availableAppointments/getAll',
      { withCredentials: true }
    );
    expect(r).toEqual(resp([{ id: 1 }]));
  });

  it('getAvailableAppointments: GET /users/availableAppointments/available', async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: 'ok' }]));
    const r = await getAvailableAppointments();
    expect(api.get).toHaveBeenCalledWith(
      '/users/availableAppointments/available',
      { withCredentials: true }
    );
    expect(r).toEqual(resp([{ id: 'ok' }]));
  });

  it('getUnavailableAppointments: GET /users/availableAppointments/unavailable', async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: 'nope' }]));
    const r = await getUnavailableAppointments();
    expect(api.get).toHaveBeenCalledWith(
      '/users/availableAppointments/unavailable',
      { withCredentials: true }
    );
    expect(r).toEqual(resp([{ id: 'nope' }]));
  });

  it('createAppointment: POST a /users/appointments/create con body y withCredentials', async () => {
    const body = { userId: 'u1', slotId: 10, address: 'Av. Siempreviva 742' };
    (api.post as any).mockResolvedValueOnce(resp({ id: 99 }));

    const r = await createAppointment(body as any);
    expect(api.post).toHaveBeenCalledWith(
      '/users/appointments/create',
      body,
      { withCredentials: true }
    );
    expect(r).toEqual(resp({ id: 99 }));
  });

  it('createAppointment: re-lanza error y loguea', async () => {
    const boom = new Error('fail create');
    (api.post as any).mockRejectedValueOnce(boom);
    await expect(createAppointment({} as any)).rejects.toThrow('fail create');
    expect(errorSpy).toHaveBeenCalledWith('Error creating appointment:', boom);
  });

  it('deleteAppointment: DELETE /users/appointments/delete/{id}', async () => {
    (api.delete as any).mockResolvedValueOnce(resp({ ok: true }));
    const r = await deleteAppointment(44);
    expect(api.delete).toHaveBeenCalledWith(
      '/users/appointments/delete/44',
      { withCredentials: true }
    );
    expect(r).toEqual(resp({ ok: true }));
  });

  it('updateAppointmentStatus: PUT /users/appointments/status/{id} con params {status} sin address', async () => {
    (api.put as any).mockResolvedValueOnce(resp({ ok: true }));
    const r = await updateAppointmentStatus(7, 'CONFIRMED' as any);
    expect(api.put).toHaveBeenCalledWith(
      '/users/appointments/status/7',
      null,
      {
        params: { status: 'CONFIRMED' },
        withCredentials: true,
      }
    );
    expect(r).toEqual(resp({ ok: true }));
  });

  it('updateAppointmentStatus: PUT /users/appointments/status/{id} con params {status, address}', async () => {
    (api.put as any).mockResolvedValueOnce(resp({ ok: true }));
    const r = await updateAppointmentStatus(8, 'ON_SITE' as any, 'Calle Falsa 123');
    expect(api.put).toHaveBeenCalledWith(
      '/users/appointments/status/8',
      null,
      {
        params: { status: 'ON_SITE', address: 'Calle Falsa 123' },
        withCredentials: true,
      }
    );
    expect(r).toEqual(resp({ ok: true }));
  });

  it('updateAppointmentStatus: re-lanza error y loguea', async () => {
    const boom = new Error('status bad');
    (api.put as any).mockRejectedValueOnce(boom);
    await expect(updateAppointmentStatus(1, 'CANCELLED' as any)).rejects.toThrow('status bad');
    expect(errorSpy).toHaveBeenCalledWith('Error updating appointment status:', boom);
  });

  it('getAppointmentById: GET /users/appointments/getById/{id}', async () => {
    (api.get as any).mockResolvedValueOnce(resp({ id: 3 }));
    const r = await getAppointmentById(3);
    expect(api.get).toHaveBeenCalledWith(
      '/users/appointments/getById/3',
      { withCredentials: true }
    );
    expect(r).toEqual(resp({ id: 3 }));
  });

  it('getAllAppointments: GET /users/appointments/getAll', async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: 1 }, { id: 2 }]));
    const r = await getAllAppointments();
    expect(api.get).toHaveBeenCalledWith(
      '/users/appointments/getAll',
      { withCredentials: true }
    );
    expect(r).toEqual(resp([{ id: 1 }, { id: 2 }]));
  });

  it('getAppointmentsByUser: GET /users/appointments/user/{userId}', async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: 'a' }]));
    const r = await getAppointmentsByUser('u1');
    expect(api.get).toHaveBeenCalledWith(
      '/users/appointments/user/u1',
      { withCredentials: true }
    );
    expect(r).toEqual(resp([{ id: 'a' }]));
  });

  it('getAppointmentsByStatus: GET /users/appointments/status con params {status}', async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: 'b' }]));
    const r = await getAppointmentsByStatus('PENDING' as any);
    expect(api.get).toHaveBeenCalledWith(
      '/users/appointments/status',
      { params: { status: 'PENDING' }, withCredentials: true }
    );
    expect(r).toEqual(resp([{ id: 'b' }]));
  });

  it('getAvailabilityById: re-lanza error y loguea', async () => {
    const boom = new Error('not found');
    (api.get as any).mockRejectedValueOnce(boom);
    await expect(getAvailabilityById(999)).rejects.toThrow('not found');
    expect(errorSpy).toHaveBeenCalledWith(
      'Error fetching availability by id:',
      boom
    );
  });

    it('updateAvailability: re-lanza error y loguea', async () => {
    const boom = new Error('upd fail');
    (api.patch as any).mockRejectedValueOnce(boom);
    await expect(updateAvailability(999)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith('Error updating availability:', boom);
  });

  it('deleteAvailability: re-lanza error y loguea', async () => {
    const boom = new Error('del fail');
    (api.delete as any).mockRejectedValueOnce(boom);
    await expect(deleteAvailability(1)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith('Error deleting availability:', boom);
  });

  it('getAllAvailabilities: re-lanza error y loguea', async () => {
    const boom = new Error('all avails fail');
    (api.get as any).mockRejectedValueOnce(boom);
    await expect(getAllAvailabilities()).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith('Error fetching all availabilities:', boom);
  });

  it('getAvailableAppointments: re-lanza error y loguea', async () => {
    const boom = new Error('avail fail');
    (api.get as any).mockRejectedValueOnce(boom);
    await expect(getAvailableAppointments()).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith('Error fetching available appointments:', boom);
  });

  it('getUnavailableAppointments: re-lanza error y loguea', async () => {
    const boom = new Error('unavail fail');
    (api.get as any).mockRejectedValueOnce(boom);
    await expect(getUnavailableAppointments()).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith('Error fetching unavailable appointments:', boom);
  });

  it('deleteAppointment: re-lanza error y loguea', async () => {
    const boom = new Error('delete appt fail');
    (api.delete as any).mockRejectedValueOnce(boom);
    await expect(deleteAppointment(123)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith('Error deleting appointment:', boom);
  });

  it('getAppointmentById: re-lanza error y loguea', async () => {
    const boom = new Error('appt by id fail');
    (api.get as any).mockRejectedValueOnce(boom);
    await expect(getAppointmentById(42)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith('Error fetching appointment by id:', boom);
  });

  it('getAllAppointments: re-lanza error y loguea', async () => {
    const boom = new Error('all appts fail');
    (api.get as any).mockRejectedValueOnce(boom);
    await expect(getAllAppointments()).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith('Error fetching all appointments:', boom);
  });

  it('getAppointmentsByUser: re-lanza error y loguea', async () => {
    const boom = new Error('by user fail');
    (api.get as any).mockRejectedValueOnce(boom);
    await expect(getAppointmentsByUser('U-1')).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith('Error fetching appointments by user:', boom);
  });

  it('getAppointmentsByStatus: re-lanza error y loguea', async () => {
    const boom = new Error('by status fail');
    (api.get as any).mockRejectedValueOnce(boom);
    await expect(getAppointmentsByStatus('PENDING' as any)).rejects.toBe(boom);
    expect(errorSpy).toHaveBeenCalledWith('Error fetching appointments by status:', boom);
  });

  it('updateAppointmentStatus: si address = "" NO se envía en params', async () => {
    (api.put as any).mockResolvedValueOnce({ data: { ok: true } });
    await updateAppointmentStatus(5, 'PENDING' as any, '');
    expect(api.put).toHaveBeenCalledWith(
      '/users/appointments/status/5',
      null,
      { params: { status: 'PENDING' }, withCredentials: true }
    );
  });

});
