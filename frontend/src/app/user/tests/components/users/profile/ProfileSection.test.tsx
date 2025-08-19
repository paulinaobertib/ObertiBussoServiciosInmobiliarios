import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, beforeEach } from "vitest";
import { ProfileSection } from "../../../../components/users/profile/ProfileSection";
import { useProfile } from "../../../../hooks/useProfile";
import { useAuthContext } from "../../../../context/AuthContext";
import { useConfirmDialog } from "../../../../../shared/components/ConfirmDialog";
import { deleteUser } from "../../../../services/user.service";

// ----- Mocks -----
vi.mock("../../../../hooks/useProfile");
vi.mock("../../../../context/AuthContext");
vi.mock("../../../../../shared/components/ConfirmDialog", () => ({
  useConfirmDialog: vi.fn(),
}));
vi.mock("../../../../services/user.service", () => ({
  deleteUser: vi.fn(),
}));

describe("ProfileSection", () => {
  const updateProfileMock = vi.fn();
  const logoutMock = vi.fn();
  const setInfoMock = vi.fn();
  const askMock = vi.fn();
  const DialogUI = <div>DialogUI</div>;

  const mockUser = {
    id: "1",
    userName: "usuario1",
    firstName: "Nombre",
    lastName: "Apellido",
    email: "test@example.com",
    phone: "1234567890",
    roles: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (useProfile as any).mockReturnValue({
      profile: mockUser,
      loading: false,
      error: null,
      updateProfile: updateProfileMock,
    });

    (useAuthContext as any).mockReturnValue({
      info: mockUser,
      logout: logoutMock,
      setInfo: setInfoMock,
    });

    (useConfirmDialog as any).mockReturnValue({ ask: askMock, DialogUI });
    (deleteUser as any).mockResolvedValue({});
  });

  it("renderiza el perfil correctamente", () => {
    render(<ProfileSection />);
    expect(screen.getByText("Ocultar perfil")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Nombre")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Apellido")).toBeInTheDocument();
  });

  it("puede alternar el modo de edición", async () => {
    render(<ProfileSection />);
    const toggleButton = screen.getByText(/Ocultar perfil/i);
    fireEvent.click(toggleButton); // colapsa perfil
    expect(screen.getByText(/Mostrar perfil/i)).toBeInTheDocument();
  });

  it("llama handleChange al modificar un campo", () => {
    render(<ProfileSection />);
    const input = screen.getByDisplayValue("Nombre");
    fireEvent.change(input, { target: { value: "NuevoNombre" } });
    expect(screen.getByDisplayValue("NuevoNombre")).toBeInTheDocument();
  });

  it("muestra loading mientras carga el perfil", () => {
  (useProfile as any).mockReturnValue({
    profile: null,
    loading: true,
    error: null,
    updateProfile: updateProfileMock,
  });
  render(<ProfileSection />);
  expect(screen.getByRole("progressbar")).toBeInTheDocument();
});

    it("muestra mensaje de error si hay error y sin perfil", () => {
  (useProfile as any).mockReturnValue({
    profile: null,
    loading: false,
    error: "Error cargando perfil",
    updateProfile: updateProfileMock,
  });
  render(<ProfileSection />);
  expect(screen.getByText(/Error cargando perfil/i)).toBeInTheDocument();
});

it("actualiza estado al cambiar un campo", () => {
  render(<ProfileSection />);
  const input = screen.getByDisplayValue("Nombre");
  fireEvent.change(input, { target: { value: "NuevoNombre" } });
  expect(screen.getByDisplayValue("NuevoNombre")).toBeInTheDocument();
});

it("colapsa y expande el perfil", () => {
  render(<ProfileSection />);
  
  // Colapsar
  fireEvent.click(screen.getByText(/Ocultar perfil/i));
  expect(screen.getByText(/Mostrar perfil/i)).toBeInTheDocument();
  
  // Expandir
  fireEvent.click(screen.getByText(/Mostrar perfil/i));
  expect(screen.getByText(/Ocultar perfil/i)).toBeInTheDocument();
});

});
