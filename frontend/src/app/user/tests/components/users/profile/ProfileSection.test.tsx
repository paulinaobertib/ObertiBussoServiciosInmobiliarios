import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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
vi.mock("../../../../components/users/profile/ProfileView", () => ({
  ProfileView: ({ editMode, saving, onToggleEdit, onDeleteProfile }: any) => (
    <div data-testid="pv">
      <button data-testid="pv-toggle" onClick={onToggleEdit}>
        {editMode ? "guardar" : "editar"}
      </button>
      <button data-testid="pv-delete" onClick={onDeleteProfile}>
        eliminar
      </button>
      <div data-testid="pv-saving">{saving ? "saving" : "idle"}</div>
    </div>
  ),
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

  it("renderiza DialogUI del confirm dialog", () => {
    render(<ProfileSection />);
    expect(screen.getByText("DialogUI")).toBeInTheDocument();
  });

  it("toggle de edición: en guardar llama updateProfile con el form y muestra saving durante la espera", async () => {
    const updateProfileMock = vi.fn().mockResolvedValue({ lastName: "Mergeado" });

    (useProfile as any).mockReturnValue({
      profile: {
        id: "1",
        userName: "usuario1",
        firstName: "Nombre",
        lastName: "Apellido",
        email: "test@example.com",
        phone: "1234567890",
        roles: [],
      },
      loading: false,
      error: null,
      updateProfile: updateProfileMock,
    });

    render(<ProfileSection />);

    // 1) Entrar en modo edición
    fireEvent.click(screen.getByTestId("pv-toggle")); // "editar"
    // Cambiar un campo del ProfileForm
    const input = screen.getByDisplayValue("Nombre");
    fireEvent.change(input, { target: { value: "NuevoNombre" } });

    // 2) Guardar → dispara updateProfile y muestra saving
    fireEvent.click(screen.getByTestId("pv-toggle")); // "guardar"
    // saving visible
    expect(screen.getByTestId("pv-saving").textContent).toBe("saving");
    await waitFor(() => expect(updateProfileMock).toHaveBeenCalledTimes(1));

    // updateProfile recibe el form con el cambio
    const payload = updateProfileMock.mock.calls[0][0];
    expect(payload.firstName).toBe("NuevoNombre");

    // Después de resolver, saving queda "idle" y editMode vuelve a false
    await waitFor(() => {
      expect(screen.getByTestId("pv-saving").textContent).toBe("idle");
      // Botón vuelve a "editar" (no editMode)
      expect(screen.getByTestId("pv-toggle").textContent).toBe("editar");
    });
  });

  it("elimina el perfil: llama deleteUser, limpia sesión, setInfo(null) y logout", async () => {
    const setInfoMock = vi.fn();
    const logoutMock = vi.fn();
    const askImpl = vi.fn((_node, onConfirm) => onConfirm?.());
    const deleteUserMock = vi.fn().mockResolvedValue(undefined);

    (useAuthContext as any).mockReturnValue({
      info: { id: "1" },
      logout: logoutMock,
      setInfo: setInfoMock,
    });
    (useConfirmDialog as any).mockReturnValue({ ask: askImpl, DialogUI: <div /> });
    (deleteUser as any).mockImplementation(deleteUserMock);

    // sembramos storage
    localStorage.setItem("k", "v");
    sessionStorage.setItem("k", "v");

    render(<ProfileSection />);

    fireEvent.click(screen.getByTestId("pv-delete"));

    await waitFor(() => {
      expect(deleteUserMock).toHaveBeenCalledWith("1");
      expect(setInfoMock).toHaveBeenCalledWith(null);
      expect(logoutMock).toHaveBeenCalled();
      expect(localStorage.getItem("k")).toBeNull();
      expect(sessionStorage.getItem("k")).toBeNull();
    });
  });

  it("eliminar sin info de usuario: muestra alert y NO llama deleteUser", async () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    const askImpl = vi.fn((_node, onConfirm) => onConfirm?.());

    (useAuthContext as any).mockReturnValue({
      info: null,
      logout: vi.fn(),
      setInfo: vi.fn(),
    });
    (useConfirmDialog as any).mockReturnValue({ ask: askImpl, DialogUI: <div /> });

    render(<ProfileSection />);
    fireEvent.click(screen.getByTestId("pv-delete"));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "No hay información de usuario. No puedes eliminar el perfil."
      );
      expect(deleteUser).not.toHaveBeenCalled();
    });

    alertSpy.mockRestore();
  });

  it("eliminar con error de API (response.data): alerta el mensaje de error", async () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    const askImpl = vi.fn((_node, onConfirm) => onConfirm?.());

    (useAuthContext as any).mockReturnValue({
      info: { id: "1" },
      logout: vi.fn(),
      setInfo: vi.fn(),
    });
    (useConfirmDialog as any).mockReturnValue({ ask: askImpl, DialogUI: <div /> });
    (deleteUser as any).mockRejectedValue({ response: { data: "Mensaje de error" } });

    render(<ProfileSection />);
    fireEvent.click(screen.getByTestId("pv-delete"));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Error: Mensaje de error");
    });

    alertSpy.mockRestore();
  });

  it("eliminar con error genérico: muestra alerta genérica", async () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    const askImpl = vi.fn((_node, onConfirm) => onConfirm?.());

    (useAuthContext as any).mockReturnValue({
      info: { id: "1" },
      logout: vi.fn(),
      setInfo: vi.fn(),
    });
    (useConfirmDialog as any).mockReturnValue({ ask: askImpl, DialogUI: <div /> });
    (deleteUser as any).mockRejectedValue(new Error("boom"));

    render(<ProfileSection />);
    fireEvent.click(screen.getByTestId("pv-delete"));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "Error al eliminar la cuenta. Intenta de nuevo."
      );
    });

    alertSpy.mockRestore();
  });

  it("no re-inicializa el form si cambia profile luego del primer render (mantiene ediciones locales)", async () => {
    // 1) primer render con perfil A
    (useProfile as any).mockReturnValueOnce({
      profile: {
        id: "1",
        userName: "usuario1",
        firstName: "Nombre",
        lastName: "Apellido",
        email: "a@a.com",
        phone: "111",
        roles: [],
      },
      loading: false,
      error: null,
      updateProfile: vi.fn(),
    });

    const { rerender } = render(<ProfileSection />);

    // Editamos localmente el nombre
    const input = screen.getByDisplayValue("Nombre");
    fireEvent.change(input, { target: { value: "EditLocal" } });
    expect(screen.getByDisplayValue("EditLocal")).toBeInTheDocument();

    // 2) el hook cambia su profile a B, pero el form debe conservar EditLocal
    (useProfile as any).mockReturnValueOnce({
      profile: {
        id: "1",
        userName: "usuario1",
        firstName: "OtroNombre",
        lastName: "Apellido",
        email: "b@b.com",
        phone: "222",
        roles: [],
      },
      loading: false,
      error: null,
      updateProfile: vi.fn(),
    });

    rerender(<ProfileSection />);

    // sigue mostrando la edición local
    expect(screen.getByDisplayValue("EditLocal")).toBeInTheDocument();
  });

});
