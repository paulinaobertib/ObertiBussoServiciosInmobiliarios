import { render, screen, fireEvent, within } from '@testing-library/react';
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


  // ======= Tests adicionales para mejorar coverage =======

it('abre y cierra menú móvil al hacer click en ícono menú', () => {
  renderNavBar();

  const menuButton = screen.getByRole('button', { name: /menu/i });
  fireEvent.click(menuButton);

  const mobileMenu = screen.getByRole('menu');
  expect(within(mobileMenu).getByText(/CONTACTO/i)).toBeVisible();

  // Cerrar menú
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

});
