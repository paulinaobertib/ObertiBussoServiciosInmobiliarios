import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { NavBar } from '../../components/Navbar';
import { ROUTES } from '../../../../lib';

// Mocks de funciones del contexto
const mockNavigate = vi.fn();
const mockClearComparison = vi.fn();
const mockResetSelected = vi.fn();
const mockPickItem = vi.fn();
const mockLogin = vi.fn();
const mockLogout = vi.fn();

// Mock de react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// === CONTEXTOS ===

// AuthContext → mock separado para poder sobreescribir dinámicamente
let mockAuthValues = {
  login: mockLogin,
  logout: mockLogout,
  isLogged: false,
  isAdmin: false,
  isTenant: false,
};

vi.mock('../../../user/context/AuthContext', () => ({
  useAuthContext: () => mockAuthValues,
}));

// PropertiesContext
vi.mock('../../../property/context/PropertiesContext', () => ({
  usePropertiesContext: () => ({
    clearComparison: mockClearComparison,
    resetSelected: mockResetSelected,
    pickItem: mockPickItem,
  }),
}));

describe('NavBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthValues = {
      login: mockLogin,
      logout: mockLogout,
      isLogged: false,
      isAdmin: false,
      isTenant: false,
    };
  });

  const setAuthMock = (override: Partial<typeof mockAuthValues>) => {
    mockAuthValues = {
      ...mockAuthValues,
      ...override,
    };
  };

  const renderNavBar = () =>
    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    );

  it('renderiza botones desktop', () => {
    renderNavBar();
    expect(screen.getByText(/CONTACTO/i)).toBeInTheDocument();
    expect(screen.getByText(/NOTICIAS/i)).toBeInTheDocument();
  });

  it('click en CONTACTO navega correctamente', () => {
    renderNavBar();
    fireEvent.click(screen.getByText(/CONTACTO/i));
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.CONTACT);
  });

  it('click en NOTICIAS navega correctamente', () => {
    renderNavBar();
    fireEvent.click(screen.getByText(/NOTICIAS/i));
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.NEWS);
  });

  it('click en logo navega a home y limpia estados', () => {
    renderNavBar();
    const logo = screen.getAllByAltText(/logo/i)[0];
    fireEvent.click(logo);
    expect(mockClearComparison).toHaveBeenCalled();
    expect(mockResetSelected).toHaveBeenCalled();
    expect(mockPickItem).toHaveBeenCalledWith('category', null);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.HOME_APP);
  });

  it('muestra botón INICIAR SESIÓN si no está logueado', () => {
    renderNavBar();
    expect(screen.getByText(/INICIAR SESIÓN/i)).toBeInTheDocument();
  });

  it('ejecuta login al hacer click en INICIAR SESIÓN', () => {
    renderNavBar();
    fireEvent.click(screen.getByText(/INICIAR SESIÓN/i));
    expect(mockLogin).toHaveBeenCalled();
  });

  it('muestra íconos de usuario si está logueado', () => {
    setAuthMock({ isLogged: true });
    renderNavBar();

    const logoutButtons = screen.getAllByLabelText(/logout/i);
    expect(logoutButtons.length).toBeGreaterThan(0);

    expect(screen.getByLabelText(/profile/i)).toBeInTheDocument();
  });

  it('click en ícono de perfil navega a ADMIN si es admin', () => {
    setAuthMock({ isLogged: true, isAdmin: true });
    renderNavBar();
    fireEvent.click(screen.getByLabelText(/profile/i));
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.ADMIN_PAGE);
  });

  it('click en ícono de perfil navega a USER_PROFILE si no es admin', () => {
    setAuthMock({ isLogged: true, isAdmin: false });
    renderNavBar();
    fireEvent.click(screen.getByLabelText(/profile/i));
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.USER_PROFILE);
  });

  it('muestra botón "SOY INQUILINO" si esTenant', () => {
    setAuthMock({ isTenant: true });
    renderNavBar();
    expect(screen.getByText(/SOY INQUILINO/i)).toBeInTheDocument();
  });

  it('click en "SOY INQUILINO" navega al contrato', () => {
    setAuthMock({ isTenant: true });
    renderNavBar();
    fireEvent.click(screen.getByText(/SOY INQUILINO/i));
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.CONTRACT);
  });

  it('click en logo mobile navega a home y limpia estados', () => {
    renderNavBar();

    const mobileLogo = screen.getByTestId('logo-mobile');
    expect(mobileLogo).toBeInTheDocument();

    fireEvent.click(mobileLogo);

    expect(mockClearComparison).toHaveBeenCalled();
    expect(mockResetSelected).toHaveBeenCalled();
    expect(mockPickItem).toHaveBeenCalledWith('category', null);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.HOME_APP);
  });

  it('muestra y navega a favoritos si usuario no es admin', () => {
    setAuthMock({ isLogged: true, isAdmin: false });
    renderNavBar();

    const favButton = screen.getByLabelText(/favorites/i);
    expect(favButton).toBeInTheDocument();

    fireEvent.click(favButton);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.FAVORITES);
  });

  it('logout llama a la función logout al hacer click', () => {
    setAuthMock({ isLogged: true });
    renderNavBar();

    const logoutButtons = screen.getAllByLabelText(/logout/i);
    fireEvent.click(logoutButtons[0]);
    expect(mockLogout).toHaveBeenCalled();
  });

it('abre y cierra menú móvil al hacer click en ícono menú', () => {
  renderNavBar();

  const menuButton = screen.getByRole('button', { name: /menu/i });
  fireEvent.click(menuButton);

  const mobileMenu = screen.getByRole('menu');
  expect(within(mobileMenu).getByText(/CONTACTO/i)).toBeVisible();

  fireEvent.click(document.body);
});

it('menú móvil muestra opción INICIAR SESIÓN si no está logueado', () => {
  renderNavBar();

  const menuButton = screen.getByRole('button', { name: /menu/i });
  fireEvent.click(menuButton);

  const mobileMenu = screen.getByRole('menu');
  const iniciarSesionBtn = within(mobileMenu).getByText(/INICIAR SESIÓN/i);
  expect(iniciarSesionBtn).toBeInTheDocument();

  fireEvent.click(iniciarSesionBtn);
  expect(mockLogin).toHaveBeenCalled();
});

  it('menú móvil muestra PERFIL/PANEL y MIS FAVORITOS si está logueado y no admin', () => {
    setAuthMock({ isLogged: true, isAdmin: false });
    renderNavBar();

    const menuButton = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(menuButton);

    expect(screen.getByText(/PERFIL/i)).toBeInTheDocument();
    expect(screen.getByText(/MIS FAVORITOS/i)).toBeInTheDocument();
  });

  it('menú móvil muestra PANEL si es admin', () => {
    setAuthMock({ isLogged: true, isAdmin: true });
    renderNavBar();

    const menuButton = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(menuButton);

    expect(screen.getByText(/PANEL/i)).toBeInTheDocument();
  });

  it('botón RealEstateAgentIcon navega a ROUTES.CONTRACT', () => {
    renderNavBar();

    const agentButton = screen.getByLabelText('real-estate-agent');
    expect(agentButton).toBeInTheDocument();

    fireEvent.click(agentButton);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.CONTRACT);
  });

  it('desktop (admin): muestra TURNERO y CONTRATOS y navega', () => {
  setAuthMock({ isLogged: true, isAdmin: true });
  renderNavBar();

  fireEvent.click(screen.getByText(/TURNERO/i));
  expect(mockNavigate).toHaveBeenCalledWith(ROUTES.APPOINTMENTS);

  fireEvent.click(screen.getByText(/CONTRATOS/i));
  expect(mockNavigate).toHaveBeenCalledWith(ROUTES.CONTRACT);
});

it('menú móvil: admin → TURNERO navega y cierra el menú', async () => {
  setAuthMock({ isLogged: true, isAdmin: true });
  renderNavBar();

  fireEvent.click(screen.getByRole('button', { name: /menu/i }));
  const menu = await screen.findByRole('menu');

  fireEvent.click(within(menu).getByText(/TURNERO/i));
  expect(mockNavigate).toHaveBeenCalledWith(ROUTES.APPOINTMENTS);

  await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
});

it('menú móvil: NOTICIAS navega y cierra el menú', async () => {
  renderNavBar();

  fireEvent.click(screen.getByRole('button', { name: /menu/i }));
  const menu = await screen.findByRole('menu');

  fireEvent.click(within(menu).getByText(/NOTICIAS/i));
  expect(mockNavigate).toHaveBeenCalledWith(ROUTES.NEWS);

  await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
});

it('menú móvil: PERFIL (no admin) navega a USER_PROFILE y cierra', async () => {
  setAuthMock({ isLogged: true, isAdmin: false });
  renderNavBar();

  fireEvent.click(screen.getByRole('button', { name: /menu/i }));
  const menu = await screen.findByRole('menu');

  fireEvent.click(within(menu).getByText(/PERFIL/i));
  expect(mockNavigate).toHaveBeenCalledWith(ROUTES.USER_PROFILE);

  await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
});

it('menú móvil: MIS FAVORITOS (no admin) navega y cierra', async () => {
  setAuthMock({ isLogged: true, isAdmin: false });
  renderNavBar();

  fireEvent.click(screen.getByRole('button', { name: /menu/i }));
  const menu = await screen.findByRole('menu');

  fireEvent.click(within(menu).getByText(/MIS FAVORITOS/i));
  expect(mockNavigate).toHaveBeenCalledWith(ROUTES.FAVORITES);

  await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
});

it('menú móvil: INICIAR SESIÓN llama a login y cierra', async () => {
  renderNavBar();

  fireEvent.click(screen.getByRole('button', { name: /menu/i }));
  const menu = await screen.findByRole('menu');

  const iniciar = within(menu).getByText(/INICIAR SESIÓN/i);
  fireEvent.click(iniciar);

  expect(mockLogin).toHaveBeenCalled();

  await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
});

// (opcional) logout en área móvil (a la derecha del header)
it('móvil: botón logout dispara logout', () => {
  setAuthMock({ isLogged: true });
  renderNavBar();

  // hay dos íconos de logout (desktop y mobile); con el primero alcanza para cubrir la rama
  const logoutBtn = screen.getAllByLabelText(/logout/i)[0];
  fireEvent.click(logoutBtn);

  expect(mockLogout).toHaveBeenCalled();
});


});
