import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { retry, sleep } from '../../../shared/utils/retry';

vi.stubEnv('VITE_GATEWAY_URL', 'http://gw.example');

vi.mock('../../services/user.service', () => ({
  getMe: vi.fn(),
  getRoles: vi.fn(),
  addPrincipalRole: vi.fn(),
}));

vi.mock('../../services/notification.service', () => ({
  getUserNotificationPreferencesByUser: vi.fn(),
  createUserNotificationPreference: vi.fn(),
}));

vi.mock('../../../shared/utils/retry', () => ({
  retry: vi.fn((fn: any) => fn()),
  sleep: vi.fn(() => Promise.resolve()),
}));

import { AuthProvider, useAuthContext } from '../../context/AuthContext';
import { getMe, getRoles, addPrincipalRole } from '../../services/user.service';
import {
  getUserNotificationPreferencesByUser,
  createUserNotificationPreference,
} from '../../services/notification.service';

describe('AuthProvider / useAuthContext', () => {
  let setItemSpy: ReturnType<typeof vi.spyOn>;
  let removeItemSpy: ReturnType<typeof vi.spyOn>;
  let clearSpy: ReturnType<typeof vi.spyOn>;
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');
    clearSpy = vi.spyOn(Storage.prototype, 'clear');

    // stub de location
    delete (window as any).location;
    (window as any).location = { href: 'http://start' };

    sessionStorage.clear();
  });

  afterEach(() => {
    setItemSpy.mockRestore();
    removeItemSpy.mockRestore();
    clearSpy.mockRestore();
    // @ts-expect-error restauramos
    window.location = originalLocation;
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  it('TENANT: crea preferencias por defecto y setea flags', async () => {
    (getMe as any).mockResolvedValueOnce({ data: { id: 'U1', name: 'User 1' } });
    (addPrincipalRole as any).mockResolvedValueOnce({});
    (getRoles as any).mockResolvedValueOnce({ data: [] });           // primera (vacía)
    (getRoles as any).mockResolvedValueOnce({ data: ['tenant'] });   // retry

    (getUserNotificationPreferencesByUser as any).mockResolvedValueOnce({ data: [] });
    (createUserNotificationPreference as any)
      .mockResolvedValueOnce({ data: { type: 'PROPIEDADNUEVA', enabled: true } })
      .mockResolvedValueOnce({ data: { type: 'PROPIEDADINTERES', enabled: true } });

    const { result } = renderHook(() => useAuthContext(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.ready).toBe(true);
    });

    expect(result.current.isLogged).toBe(true);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isTenant).toBe(true);
    expect(result.current.info?.roles).toEqual(['TENANT']);
    expect(result.current.info?.preferences).toHaveLength(2);
    expect(setItemSpy).toHaveBeenCalledWith(
      'authInfo',
      expect.stringContaining('"roles":["TENANT"]')
    );
  });

  it('ADMIN: no crea preferencias y marca isAdmin', async () => {
    (getMe as any).mockResolvedValueOnce({ data: { id: 'A1', name: 'Admin' } });
    (addPrincipalRole as any).mockResolvedValueOnce({});
    (getRoles as any).mockResolvedValueOnce({ data: ['admin'] });
    (getRoles as any).mockResolvedValueOnce({ data: ['admin'] });

    const { result } = renderHook(() => useAuthContext(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isLogged).toBe(true);
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.isTenant).toBe(false);
    expect(result.current.info?.roles).toEqual(['ADMIN']);
    expect(getUserNotificationPreferencesByUser).not.toHaveBeenCalled();
    expect(createUserNotificationPreference).not.toHaveBeenCalled();
  });

  it('login redirige a /oauth2/authorization/keycloak-client', async () => {
    (getMe as any).mockResolvedValueOnce({ data: { id: 'U2' } });
    (addPrincipalRole as any).mockResolvedValueOnce({});
    (getRoles as any).mockResolvedValueOnce({ data: ['tenant'] });
    (getRoles as any).mockResolvedValueOnce({ data: ['tenant'] });
    (getUserNotificationPreferencesByUser as any).mockResolvedValueOnce({ data: [] });
    (createUserNotificationPreference as any)
      .mockResolvedValueOnce({ data: { type: 'PROPIEDADNUEVA', enabled: true } })
      .mockResolvedValueOnce({ data: { type: 'PROPIEDADINTERES', enabled: true } });

    const { result } = renderHook(() => useAuthContext(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.login());
    expect((window as any).location.href).toBe(
      'http://gw.example/oauth2/authorization/keycloak-client?next=/'
    );
  });

  it('logout limpia storage y navega a /logout', async () => {
    (getMe as any).mockResolvedValueOnce({ data: { id: 'U3' } });
    (addPrincipalRole as any).mockResolvedValueOnce({});
    (getRoles as any).mockResolvedValueOnce({ data: ['tenant'] });
    (getRoles as any).mockResolvedValueOnce({ data: ['tenant'] });
    (getUserNotificationPreferencesByUser as any).mockResolvedValueOnce({ data: [] });
    (createUserNotificationPreference as any)
      .mockResolvedValueOnce({ data: { type: 'PROPIEDADNUEVA', enabled: true } })
      .mockResolvedValueOnce({ data: { type: 'PROPIEDADINTERES', enabled: true } });

    const { result } = renderHook(() => useAuthContext(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(setItemSpy).toHaveBeenCalled();

    await act(async () => {
      result.current.logout();
    });

    expect(clearSpy).toHaveBeenCalled();
    expect((window as any).location.href).toBe('http://gw.example/logout');
    expect(result.current.info).toBeNull();
  });

  it('refreshUser vuelve a cargar info', async () => {
    (getMe as any).mockResolvedValueOnce({ data: { id: 'U4', name: 'Primera' } });
    (addPrincipalRole as any).mockResolvedValueOnce({});
    (getRoles as any).mockResolvedValueOnce({ data: [] });
    (getRoles as any).mockResolvedValueOnce({ data: ['tenant'] });
    (getUserNotificationPreferencesByUser as any).mockResolvedValueOnce({ data: [] });
    (createUserNotificationPreference as any)
      .mockResolvedValueOnce({ data: { type: 'PROPIEDADNUEVA', enabled: true } })
      .mockResolvedValueOnce({ data: { type: 'PROPIEDADINTERES', enabled: true } });

    const { result } = renderHook(() => useAuthContext(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.info?.id).toBe('U4');

    (getMe as any).mockResolvedValueOnce({ data: { id: 'U5', name: 'Segunda' } });
    (addPrincipalRole as any).mockResolvedValueOnce({});
    (getRoles as any).mockResolvedValueOnce({ data: ['tenant'] });
    (getRoles as any).mockResolvedValueOnce({ data: ['tenant'] });
    (getUserNotificationPreferencesByUser as any).mockResolvedValueOnce({ data: [] });
    (createUserNotificationPreference as any)
      .mockResolvedValueOnce({ data: { type: 'PROPIEDADNUEVA', enabled: true } })
      .mockResolvedValueOnce({ data: { type: 'PROPIEDADINTERES', enabled: true } });

    await act(async () => {
      await result.current.refreshUser();
    });

    expect(result.current.info?.id).toBe('U5');
  });

  it('si getMe falla: info=null, ready=false, loading=false', async () => {
    (getMe as any).mockRejectedValueOnce(new Error('boom'));
    const { result } = renderHook(() => useAuthContext(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.info).toBeNull();
    expect(result.current.ready).toBe(false);
  });

  it('useAuthContext fuera del provider devuelve defaults', () => {
    const { result } = renderHook(() => useAuthContext());
    expect(result.current.isLogged).toBe(false);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isTenant).toBe(false);
    expect(result.current.ready).toBe(false);
    expect(result.current.loading).toBe(false);
    expect(result.current.info).toBeNull();
    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.logout).toBe('function');
    expect(typeof result.current.refreshUser).toBe('function');
  });

  it('TENANT con preferencias existentes (sin .data): NO crea defaults y usa las existentes; hace sleep(100000) y addPrincipalRole()', async () => {
    // 1) getMe ok
    (getMe as any).mockResolvedValueOnce({ data: { id: 'U-EXIST', name: 'Existente' } });
    // 2) addPrincipalRole siempre se llama
    (addPrincipalRole as any).mockResolvedValueOnce({});
    // 3) primera getRoles vacía, retry devuelve 'tenant'
    (getRoles as any).mockResolvedValueOnce({ data: [] });
    (getRoles as any).mockResolvedValueOnce({ data: ['tenant'] });

    // 4) preferencias YA existen y el servicio devuelve el array directamente (sin .data)
    const existingPrefs = [
      { type: 'PROPIEDADNUEVA', enabled: true },
      { type: 'PROPIEDADINTERES', enabled: false },
    ];
    (getUserNotificationPreferencesByUser as any).mockResolvedValueOnce(existingPrefs);

    const { result } = renderHook(() => useAuthContext(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.ready).toBe(true);
    });

    // No se crean prefs nuevas
    expect(createUserNotificationPreference).not.toHaveBeenCalled();
    // Usa las existentes
    expect(result.current.info?.preferences).toEqual(existingPrefs);
    // Roles y flags
    expect(result.current.info?.roles).toEqual(['TENANT']);
    expect(result.current.isTenant).toBe(true);
    // addPrincipalRole fue invocado
    expect(addPrincipalRole).toHaveBeenCalled();
    // sleep(100000) se invocó
    expect((sleep as any).mock.calls.some((c: any[]) => c[0] === 100000)).toBe(true);
  });

  it('refreshUser alterna loading durante la recarga', async () => {
    (getMe as any).mockResolvedValueOnce({ data: { id: 'R1' } });
    (addPrincipalRole as any).mockResolvedValueOnce({});
    (getRoles as any).mockResolvedValueOnce({ data: ['tenant'] });
    (getRoles as any).mockResolvedValueOnce({ data: ['tenant'] });
    (getUserNotificationPreferencesByUser as any).mockResolvedValueOnce({ data: [] });
    (createUserNotificationPreference as any)
      .mockResolvedValueOnce({ data: { type: 'PROPIEDADNUEVA', enabled: true } })
      .mockResolvedValueOnce({ data: { type: 'PROPIEDADINTERES', enabled: true } });

    const { result } = renderHook(() => useAuthContext(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    let resolveRefresh!: (v: any) => void;
    (getMe as any).mockImplementationOnce(
      () => new Promise((res) => { resolveRefresh = res; })
    );
    (addPrincipalRole as any).mockResolvedValueOnce({});
    (getRoles as any).mockResolvedValueOnce({ data: ['tenant'] });
    (getRoles as any).mockResolvedValueOnce({ data: ['tenant'] });
    (getUserNotificationPreferencesByUser as any).mockResolvedValueOnce({ data: [] });
    (createUserNotificationPreference as any)
      .mockResolvedValueOnce({ data: { type: 'PROPIEDADNUEVA', enabled: true } })
      .mockResolvedValueOnce({ data: { type: 'PROPIEDADINTERES', enabled: true } });

    // Lanzamos el refresh (sin await) y verificamos el flip a true
    act(() => {
      result.current.refreshUser();
    });
    await waitFor(() => expect(result.current.loading).toBe(true));

    // 3) Ahora resolvemos el getMe del refresh y esperamos que termine
    await act(async () => {
      resolveRefresh({ data: { id: 'R2' } });
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.info?.id).toBe('R2');
  });

  it('TENANT: crea defaults pero el service devuelve objetos sin .data (cubre r.data ?? r)', async () => {
  (getMe as any).mockResolvedValueOnce({ data: { id: 'U6' } });
  (addPrincipalRole as any).mockResolvedValueOnce({});
  (getRoles as any).mockResolvedValueOnce({ data: [] });          // primer getRoles
  (getRoles as any).mockResolvedValueOnce({ data: ['tenant'] });  // retry devuelve algo

  // Fuerza creación de defaults: prefs existentes vacías
  (getUserNotificationPreferencesByUser as any).mockResolvedValueOnce({ data: [] });

  (createUserNotificationPreference as any)
    .mockResolvedValueOnce({ type: 'PROPIEDADNUEVA', enabled: true })
    .mockResolvedValueOnce({ type: 'PROPIEDADINTERES', enabled: true });

  const { result } = renderHook(() => useAuthContext(), { wrapper });

  await waitFor(() => {
    expect(result.current.loading).toBe(false);
    expect(result.current.ready).toBe(true);
  });

  expect(result.current.info?.preferences).toEqual([
    { type: 'PROPIEDADNUEVA', enabled: true },
    { type: 'PROPIEDADINTERES', enabled: true },
  ]);
});

it('Roles nunca llegan (retry sigue fallando): cae al catch y limpia estado', async () => {
  (getMe as any).mockResolvedValueOnce({ data: { id: 'U7' } });
  (addPrincipalRole as any).mockResolvedValueOnce({});

  // primer getRoles vacío
  (getRoles as any).mockResolvedValueOnce({ data: [] });

  // El callback que usa retry lanza siempre (porque data vacío) -> simulamos que retry SOLO ejecuta fn() y deja propagar
  (retry as any).mockImplementationOnce(async (fn: any) => {
    // ejecuta una vez y deja que la excepción salga
    return fn();
  });

  const { result } = renderHook(() => useAuthContext(), { wrapper });

  // Termina en catch: info=null, ready=false, loading=false
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.info).toBeNull();
  expect(result.current.ready).toBe(false);
});

it('retry reintenta: 2 intentos con error (roles vacíos) y luego éxito (TENANT)', async () => {
  (getMe as any).mockResolvedValueOnce({ data: { id: 'U8' } });
  (addPrincipalRole as any).mockResolvedValueOnce({});

  // primer getRoles (previo a retry): vacío
  (getRoles as any).mockResolvedValueOnce({ data: [] });

  (retry as any).mockImplementationOnce(async (fn: any) => {
    let attempts = 0;
    // llamamos fn() y si falla dos veces, devolvemos data "a mano"
    while (true) {
      try {
        attempts++;
        await fn(); // va a lanzar porque getRoles.data estará vacío en el callback
      } catch {
        if (attempts >= 2) {
          // simulamos que a la 3ª "anda": devolvemos data de roles
          return ['tenant'];
        }
        continue;
      }
    }
  });

  (getUserNotificationPreferencesByUser as any).mockResolvedValueOnce({ data: [] });
  (createUserNotificationPreference as any)
    .mockResolvedValueOnce({ data: { type: 'PROPIEDADNUEVA', enabled: true } })
    .mockResolvedValueOnce({ data: { type: 'PROPIEDADINTERES', enabled: true } });

  const { result } = renderHook(() => useAuthContext(), { wrapper });

  await waitFor(() => {
    expect(result.current.loading).toBe(false);
    expect(result.current.ready).toBe(true);
  });

  expect(result.current.info?.roles).toEqual(['TENANT']);
  expect(result.current.isTenant).toBe(true);
  expect(createUserNotificationPreference).toHaveBeenCalledTimes(2);
});

it('useAuthContext fuera del provider: ejecuta funciones default (setInfo, login, logout, refreshUser) sin errores', async () => {
  // NO usamos wrapper para obtener el contexto por defecto
  const { result } = renderHook(() => useAuthContext());

  // setInfo default (no-op)
  expect(() => result.current.setInfo(null)).not.toThrow();

  // login/logout defaults (no-op)
  expect(() => result.current.login()).not.toThrow();
  expect(() => result.current.logout()).not.toThrow();

  // refreshUser default (Promise<void> resuelta)
  await expect(result.current.refreshUser()).resolves.toBeUndefined();

  // sanity: siguen siendo los valores por defecto
  expect(result.current.isLogged).toBe(false);
  expect(result.current.info).toBeNull();
});

});
