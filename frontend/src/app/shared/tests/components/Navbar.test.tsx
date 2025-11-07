import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { NavBar } from "../../components/Navbar";
import { ROUTES } from "../../../../lib";

// Mocks de funciones del contexto
const mockNavigate = vi.fn();
const mockClearComparison = vi.fn();
const mockResetSelected = vi.fn();
const mockPickItem = vi.fn();
const mockLogin = vi.fn();
const mockLogout = vi.fn();

// Mock de react-router-dom
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// === CONTEXTOS ===

// AuthContext → mock configurable por test
let mockAuthValues = {
  login: mockLogin,
  logout: mockLogout,
  isLogged: false,
  isAdmin: false,
  isTenant: false,
  info: null as any,
};

vi.mock("../../../user/context/AuthContext", () => ({
  useAuthContext: () => mockAuthValues,
}));

// PropertiesContext
vi.mock("../../../property/context/PropertiesContext", () => ({
  usePropertiesContext: () => ({
    clearComparison: mockClearComparison,
    resetSelected: mockResetSelected,
    pickItem: mockPickItem,
  }),
}));

describe("NavBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthValues = {
      login: mockLogin,
      logout: mockLogout,
      isLogged: false,
      isAdmin: false,
      isTenant: false,
      info: null,
    };
  });

  const setAuthMock = (override: Partial<typeof mockAuthValues>) => {
    mockAuthValues = { ...mockAuthValues, ...override };
  };

  const renderNavBar = () =>
    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    );

  // ===== Desktop (sm+) botones estáticos =====
  it("renderiza botones desktop", () => {
    renderNavBar();
    // CONTACTO (no admin) y NOTICIAS visibles en desktop
    expect(screen.getByText(/CONTACTO/i)).toBeInTheDocument();
    expect(screen.getByText(/NOTICIAS/i)).toBeInTheDocument();
  });

  it("click en CONTACTO navega correctamente (no admin)", () => {
    renderNavBar();
    fireEvent.click(screen.getByText(/CONTACTO/i));
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.CONTACT);
  });

  it("click en NOTICIAS navega correctamente", () => {
    renderNavBar();
    fireEvent.click(screen.getByText(/NOTICIAS/i));
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.NEWS);
  });

  // ===== Logo =====
  it("click en logo desktop navega a home y limpia estados", () => {
    renderNavBar();
    const logo = screen.getAllByAltText(/logo/i)[0];
    fireEvent.click(logo);
    expect(mockClearComparison).toHaveBeenCalled();
    expect(mockResetSelected).toHaveBeenCalled();
    expect(mockPickItem).toHaveBeenCalledWith("category", null);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.HOME_APP);
  });

  it("click en logo mobile navega a home y limpia estados", () => {
    renderNavBar();
    const mobileLogo = screen.getByTestId("logo-mobile");
    expect(mobileLogo).toBeInTheDocument();
    fireEvent.click(mobileLogo);
    expect(mockClearComparison).toHaveBeenCalled();
    expect(mockResetSelected).toHaveBeenCalled();
    expect(mockPickItem).toHaveBeenCalledWith("category", null);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.HOME_APP);
  });

  // ===== Login/Logout desktop =====
  it("muestra botón INICIAR SESIÓN (desktop) si no está logueado", () => {
    renderNavBar();
    expect(screen.getByText(/INICIAR SESIÓN/i)).toBeInTheDocument();
  });

  it("ejecuta login al hacer click en INICIAR SESIÓN (desktop)", () => {
    renderNavBar();
    fireEvent.click(screen.getByText(/INICIAR SESIÓN/i));
    expect(mockLogin).toHaveBeenCalled();
  });

  it("muestra íconos de usuario en desktop si está logueado", () => {
    setAuthMock({ isLogged: true });
    renderNavBar();

    // Ahora tomamos todos y comprobamos que haya al menos uno
    const profileIcons = screen.getAllByLabelText(/profile/i);
    expect(profileIcons.length).toBeGreaterThan(0);

    const logoutButtons = screen.getAllByLabelText(/logout/i);
    expect(logoutButtons.length).toBeGreaterThan(0);
  });

  it("click en ícono de perfil navega a ADMIN si es admin", () => {
    setAuthMock({ isLogged: true, isAdmin: true });
    renderNavBar();

    // Elegimos el primero para evitar la ambigüedad (mobile/desktop)
    const profileIcon = screen.getAllByLabelText(/profile/i)[0];
    fireEvent.click(profileIcon);

    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.ADMIN_PAGE);
  });

  it("click en ícono de perfil navega a USER_PROFILE si no es admin", () => {
    setAuthMock({ isLogged: true, isAdmin: false });
    renderNavBar();

    const profileIcon = screen.getAllByLabelText(/profile/i)[0];
    fireEvent.click(profileIcon);

    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.USER_PROFILE);
  });

  // ===== Desktop: inquilino / admin extras =====
  it('muestra botón "SOY INQUILINO" en desktop si esTenant', () => {
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

  it("muestra y navega a favoritos en desktop si usuario no es admin", () => {
    setAuthMock({ isLogged: true, isAdmin: false });
    renderNavBar();
    const favButton = screen.getByLabelText(/favorites/i);
    expect(favButton).toBeInTheDocument();
    fireEvent.click(favButton);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.FAVORITES);
  });

  it("logout (desktop) llama a logout al hacer click", () => {
    setAuthMock({ isLogged: true });
    renderNavBar();
    const logoutButtons = screen.getAllByLabelText(/logout/i);
    fireEvent.click(logoutButtons[0]);
    expect(mockLogout).toHaveBeenCalled();
  });

  it("desktop (admin): muestra TURNERO y CONTRATOS y navega", () => {
    setAuthMock({ isLogged: true, isAdmin: true });
    renderNavBar();
    fireEvent.click(screen.getByText(/TURNERO/i));
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.APPOINTMENTS);
    fireEvent.click(screen.getByText(/CONTRATOS/i));
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.CONTRACT);
  });

  // ===== Móvil (xs) comportamiento menú =====
  it("móvil (no logueado): menú muestra acciones públicas y login funciona", async () => {
    renderNavBar();

    const loginBtn = screen.getByLabelText(/login/i);
    fireEvent.click(loginBtn);
    expect(mockLogin).toHaveBeenCalled();

    fireEvent.click(screen.getByLabelText(/menu/i));

    await screen.findByText(/Bienvenido/i);

    const contactAction = await screen.findByRole("button", { name: /Contacto \/ Turnero de Citas/i });
    fireEvent.click(contactAction);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.CONTACT);

    const newsAction = await screen.findByRole("button", { name: /Noticias/i });
    fireEvent.click(newsAction);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.NEWS);
  });

  it("móvil (usuario no admin): menú incluye acciones de perfil y favoritos", async () => {
    setAuthMock({
      isLogged: true,
      isAdmin: false,
      info: { firstName: "Ada", lastName: "Lovelace", userName: "ada", email: "ada@dev.com" },
    });
    renderNavBar();

    fireEvent.click(screen.getByLabelText(/menu/i));

    await screen.findByText(/Bienvenido/i);

    const profileAction = await screen.findByRole("button", { name: /Mi Perfil/i });
    fireEvent.click(profileAction);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.USER_PROFILE);

    fireEvent.click(screen.getByLabelText(/menu/i));
    const favoritesAction = await screen.findByRole("button", { name: /Mis Favoritos/i });
    fireEvent.click(favoritesAction);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.FAVORITES);
  });

  it("móvil (tenant): menú agrega acceso a contratos", async () => {
    setAuthMock({
      isLogged: true,
      isAdmin: false,
      isTenant: true,
      info: { firstName: "Juan", lastName: "Inquilino", userName: "juan", email: "juan@test.com" },
    });
    renderNavBar();

    fireEvent.click(screen.getByLabelText(/menu/i));

    const contractsAction = await screen.findByRole("button", { name: /Mis Contratos de Alquiler/i });
    fireEvent.click(contractsAction);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.CONTRACT);
  });

  it("móvil (admin): menú muestra accesos administrativos adicionales", async () => {
    setAuthMock({
      isLogged: true,
      isAdmin: true,
      info: { firstName: "Root", lastName: "Admin", userName: "root", email: "root@test.com" },
    });
    renderNavBar();

    fireEvent.click(screen.getByLabelText(/menu/i));

    const appointmentsAction = await screen.findByRole("button", { name: /Turnero de Citas/i });
    fireEvent.click(appointmentsAction);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.APPOINTMENTS);

    fireEvent.click(screen.getByLabelText(/menu/i));
    const statsAction = await screen.findByRole("button", { name: /Ver Estadísticas/i });
    fireEvent.click(statsAction);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.CONTRACT);
  });

  it("móvil: botón logout en encabezado dispara logout", () => {
    setAuthMock({
      isLogged: true,
      info: { firstName: "Test", lastName: "User", userName: "user", email: "user@test.com" },
    });
    renderNavBar();
    const logoutBtn = screen.getAllByLabelText(/logout/i)[0];
    fireEvent.click(logoutBtn);
    expect(mockLogout).toHaveBeenCalled();
  });
});
