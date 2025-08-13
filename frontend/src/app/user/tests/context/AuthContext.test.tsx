// src/app/user/context/__tests__/AuthContext.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { AuthProvider, useAuthContext } from '../../context/AuthContext';
import { api } from '../../../../api';

// Mock del módulo api
vi.mock('../../../../api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// Componente consumidor para interactuar con el context
function TestConsumer() {
  const { info, isLogged, isAdmin, isTenant, loading, login, logout, refreshUser, setInfo } =
    useAuthContext();
  return (
    <div>
      <div data-testid="isLogged">{String(isLogged)}</div>
      <div data-testid="isAdmin">{String(isAdmin)}</div>
      <div data-testid="isTenant">{String(isTenant)}</div>
      <div data-testid="loading">{String(loading)}</div>
      <div data-testid="username">{info?.userName ?? ''}</div>

      <button onClick={login}>login</button>
      <button onClick={logout}>logout</button>
      <button onClick={refreshUser}>refresh</button>
      <button onClick={() => setInfo(null)}>setInfoNull</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  );
}

// Utilidad: hacer location.href writable en JSDOM
function stubLocationHref(start: string) {
  const loc: any = { href: start };
  Object.defineProperty(window, 'location', { value: loc, writable: true });
  return loc;
}

const GATEWAY = 'http://gw.local';

describe('AuthContext', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();

    // Stub de env var que usa el provider (no confiamos en que afecte al build,
    // por eso los tests de URL matchean por path en vez de host)
    (import.meta as any).env = {
      ...(import.meta as any).env,
      VITE_GATEWAY_URL: GATEWAY,
    };

    stubLocationHref('http://app.local/');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('usar useAuthContext fuera del AuthProvider NO lanza error (valor por defecto del contexto)', () => {
    const Broken = () => {
      useAuthContext();
      return <div>ok</div>;
    };
    expect(() => render(<Broken />)).not.toThrow();
  });

  it('login redirige a la URL de OAuth (validando path y query)', () => {
    renderWithProvider();
    fireEvent.click(screen.getByText('login'));
    expect(window.location.href).toMatch(
      /\/oauth2\/authorization\/keycloak-client\?next=\//
    );
  });

  it('logout limpia sessionStorage, flags y redirige a /logout (validando path)', async () => {
    sessionStorage.setItem(
      'authInfo',
      JSON.stringify({
        id: 'u1',
        username: 'v',
        email: 'v@x.com',
        roles: ['TENANT'],
        preferences: [],
      })
    );

    renderWithProvider();

    fireEvent.click(screen.getByText('logout'));

    expect(sessionStorage.getItem('authInfo')).toBeNull();
    expect(window.location.href).toMatch(/\/logout$/);

    await waitFor(() => {
      expect(screen.getByTestId('isLogged').textContent).toBe('false');
      expect(screen.getByTestId('isAdmin').textContent).toBe('false');
      expect(screen.getByTestId('isTenant').textContent).toBe('false');
    });
  });

  it('sincroniza sessionStorage: setInfo(null) elimina authInfo', async () => {
    sessionStorage.setItem(
      'authInfo',
      JSON.stringify({
        id: 'u1',
        username: 'v',
        email: 'v@x.com',
        roles: ['TENANT'],
        preferences: [],
      })
    );

    renderWithProvider();

    fireEvent.click(screen.getByText('setInfoNull'));

    await waitFor(() => {
      expect(sessionStorage.getItem('authInfo')).toBeNull();
    });
  });

  it('sin sessionStorage: carga usuario + roles + crea preferencias si no hay (TENANT)', async () => {
    // GETs
    (api.get as any).mockImplementation(async (url: string) => {
      if (url === '/users/user/me')
        return { data: { id: 'u1', username: 'v', email: 'v@x.com' } };
      if (url === '/users/user/role/u1') return { data: ['tenant'] }; // minúsculas -> se uppercasa
      if (url === '/users/preference/user/u1') return { data: [] }; // fuerza creación
      throw new Error('unexpected GET ' + url);
    });
    // POSTs (creación de 2 preferencias)
    (api.post as any).mockImplementation(async (url: string, body: any) => {
      if (url === '/users/preference/create') {
        return { data: { id: Math.random().toString(), ...body } };
      }
      throw new Error('unexpected POST ' + url);
    });

    renderWithProvider();

    // loading pasa de true a false tras la carga
    expect(screen.getByTestId('loading').textContent).toBe('true');

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
      expect(screen.getByTestId('isLogged').textContent).toBe('true');
      expect(screen.getByTestId('isTenant').textContent).toBe('true');
      expect(screen.getByTestId('isAdmin').textContent).toBe('false');
    });

    // endpoints esperados
    expect(api.get).toHaveBeenCalledWith('/users/user/me');
    expect(api.get).toHaveBeenCalledWith('/users/user/role/u1');
    expect(api.get).toHaveBeenCalledWith('/users/preference/user/u1');
    expect(api.post).toHaveBeenCalledTimes(2);

    // persistió en sessionStorage
    const saved = JSON.parse(sessionStorage.getItem('authInfo')!);
    expect(saved.username).toBe('v');
    expect(Array.isArray(saved.preferences)).toBe(true);
    expect(saved.preferences).toHaveLength(2);
  });

  it('si es ADMIN no solicita ni crea preferencias', async () => {
    (api.get as any).mockImplementation(async (url: string) => {
      if (url === '/users/user/me')
        return { data: { id: 'u2', username: 'admin', email: 'a@x.com' } };
      if (url === '/users/user/role/u2') return { data: ['ADMIN'] };
      if (url.startsWith('/users/preference'))
        throw new Error('no debería pedir preferencias para ADMIN');
      throw new Error('unexpected GET ' + url);
    });

    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
      expect(screen.getByTestId('isLogged').textContent).toBe('true');
      expect(screen.getByTestId('isAdmin').textContent).toBe('true');
      expect(screen.getByTestId('isTenant').textContent).toBe('false');
    });

    expect(api.post).not.toHaveBeenCalled();
  });

  it('en error durante la carga deja info=null y loading=false', async () => {
    (api.get as any).mockRejectedValue(new Error('boom'));

    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
      expect(screen.getByTestId('isLogged').textContent).toBe('false');
    });
  });

  it('refreshUser vuelve a invocar la carga desde API', async () => {
    (api.get as any)
      .mockResolvedValueOnce({
        data: { id: 'u1', username: 'v', email: 'v@x.com' },
      }) // me
      .mockResolvedValueOnce({ data: ['TENANT'] }) // roles
      .mockResolvedValueOnce({ data: [] }); // prefs
    (api.post as any).mockResolvedValue({
      data: {
        id: 'p1',
        userId: 'u1',
        type: 'PROPIEDADNUEVA',
        enabled: true,
      },
    });

    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    fireEvent.click(screen.getByText('refresh'));

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/users/user/me');
    });
  });

  it('si ya hay preferencias, no crea nuevas (TENANT)', async () => {
    (api.get as any).mockImplementation(async (url: string) => {
      if (url === '/users/user/me')
        return { data: { id: 'u1', username: 'v', email: 'v@x.com' } };
      if (url === '/users/user/role/u1') return { data: ['tenant'] };
      if (url === '/users/preference/user/u1') {
        return {
          data: [
            {
              id: 'p1',
              userId: 'u1',
              type: 'PROPIEDADNUEVA',
              enabled: true,
            },
          ],
        };
      }
      throw new Error('unexpected GET ' + url);
    });

    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
      expect(screen.getByTestId('isLogged').textContent).toBe('true');
    });

    expect(api.post).not.toHaveBeenCalled();

    const saved = JSON.parse(sessionStorage.getItem('authInfo')!);
    expect(saved.preferences).toHaveLength(1);
    expect(saved.preferences[0].type).toBe('PROPIEDADNUEVA');
  });

  it('normaliza roles a mayúsculas al persistir', async () => {
    (api.get as any)
      .mockResolvedValueOnce({
        data: { id: 'u1', username: 'v', email: 'v@x.com' },
      }) // me
      .mockResolvedValueOnce({ data: ['tenant'] }) // roles en minúsculas
      .mockResolvedValueOnce({ data: [] }); // prefs vacías -> creará 2
    (api.post as any).mockResolvedValue({
      data: {
        id: 'p1',
        userId: 'u1',
        type: 'PROPIEDADNUEVA',
        enabled: true,
      },
    });

    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    const saved = JSON.parse(sessionStorage.getItem('authInfo')!);
    expect(saved.roles).toEqual(['TENANT']);
  });

  it('refreshUser alterna loading=true mientras recarga', async () => {
    // Primera carga
    (api.get as any)
      .mockResolvedValueOnce({
        data: { id: 'u1', username: 'v', email: 'v@x.com' },
      })
      .mockResolvedValueOnce({ data: ['TENANT'] })
      .mockResolvedValueOnce({ data: [] });
    (api.post as any).mockResolvedValue({
      data: {
        id: 'p1',
        userId: 'u1',
        type: 'PROPIEDADNUEVA',
        enabled: true,
      },
    });

    renderWithProvider();
    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    );

    // Segunda carga (refresh)
    (api.get as any)
      .mockResolvedValueOnce({
        data: { id: 'u1', username: 'v2', email: 'v2@x.com' },
      })
      .mockResolvedValueOnce({ data: ['tenant'] })
      .mockResolvedValueOnce({
        data: [
          {
            id: 'p1',
            userId: 'u1',
            type: 'PROPIEDADNUEVA',
            enabled: true,
          },
        ],
      });

    fireEvent.click(screen.getByText('refresh'));

    // loading pasa a true y luego a false
    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('true')
    );
    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    );
  });

  it('crea ambas preferencias con enabled=true cuando no existen (payload correcto)', async () => {
    (api.get as any).mockImplementation(async (url: string) => {
      if (url === '/users/user/me')
        return { data: { id: 'u1', username: 'v', email: 'v@x.com' } };
      if (url === '/users/user/role/u1') return { data: ['TENANT'] };
      if (url === '/users/preference/user/u1') return { data: [] };
      throw new Error('unexpected GET ' + url);
    });
    (api.post as any).mockResolvedValue({
      data: { id: 'pX', userId: 'u1', type: 'X', enabled: true },
    });

    renderWithProvider();

    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    );

    expect(api.post).toHaveBeenCalledTimes(2);
    const types = (api.post as any).mock.calls
      .map(([, body]: any[]) => body.type)
      .sort();
    expect(types).toEqual(['PROPIEDADINTERES', 'PROPIEDADNUEVA'].sort());

    (api.post as any).mock.calls.forEach(([, body]: any[]) => {
      expect(body).toMatchObject({ userId: 'u1', enabled: true });
    });
  });

});
