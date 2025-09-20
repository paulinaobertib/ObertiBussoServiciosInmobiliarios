/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

const h = vi.hoisted(() => ({
  // useProfile
  profile: null as any,
  loading: false,
  updateProfile: vi.fn(async (u: any) => u),

  // ConfirmDialog
  autoConfirm: true,

  // AuthContext
  info: null as any,
  setInfo: vi.fn(),
  logout: vi.fn(),

  // Servicio deleteUser
  deleteUserMock: vi.fn(async (_id: number) => {}),

  // Para verificar qué user llega a ProfileForm (sincronia)
  lastFormUser: null as any,
}));


vi.mock("../../../../hooks/useProfile", () => ({
  useProfile: () => ({
    profile: h.profile,
    loading: h.loading,
    updateProfile: h.updateProfile,
  }),
}));

vi.mock("../../../../../shared/components/ConfirmDialog", () => ({
  useConfirmDialog: () => ({
    ask: (_content: any, onConfirm: () => void | Promise<void>) => {
      if (h.autoConfirm && onConfirm) void onConfirm();
    },
    DialogUI: <div data-testid="confirm-dialog-ui" />,
  }),
}));

vi.mock("../../../../services/user.service", () => ({
  deleteUser: (...args: any[]) => h.deleteUserMock(...(args as [number])),
}));

vi.mock("../../../../context/AuthContext", () => ({
  useAuthContext: () => ({
    info: h.info,
    setInfo: h.setInfo,
    logout: h.logout,
  }),
}));

vi.mock("../../../../components/users/profile/ProfileView", () => ({
  ProfileView: ({
    user,
    editMode,
    saving,
    onToggleEdit,
    onDeleteProfile,
  }: any) => (
    <div data-testid="profile-view">
      <div data-testid="pv-name">{user?.name ?? ""}</div>
      {editMode && <div data-testid="pv-edit-flag">edit</div>}
      {saving && <div data-testid="pv-saving-flag">Guardando...</div>}
      <button onClick={onToggleEdit} aria-label="toggle-edit">
        {editMode ? "Guardar" : "Editar"}
      </button>
      <button onClick={onDeleteProfile} aria-label="delete-profile">
        Eliminar
      </button>
    </div>
  ),
}));

vi.mock("../../../../components/users/profile/ProfileForm", () => ({
  ProfileForm: ({ user, editMode, onChange }: any) => {
    h.lastFormUser = user;
    return (
      <div data-testid="profile-form">
        <div data-testid="pf-name">{user?.name ?? ""}</div>
        <div data-testid="pf-email">{user?.email ?? ""}</div>
        <div data-testid="pf-edit">{String(!!editMode)}</div>
        <button
          aria-label="set-name"
          onClick={() => onChange?.("name", "Nuevo Nombre")}
        >
          set-name
        </button>
        <button
          aria-label="set-email"
          onClick={() => onChange?.("email", "nuevo@example.com")}
        >
          set-email
        </button>
      </div>
    );
  },
}));

import { ProfileSection } from "../../../../components/users/profile/ProfileSection";

/* ============================ UTILS ============================ */
const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

/* ============================ TESTS ============================ */
describe("ProfileSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Estado por defecto de mocks
    h.profile = null;
    h.loading = false;
    h.updateProfile = vi.fn(async (u: any) => u);
    h.autoConfirm = true;
    h.info = null;
    h.setInfo = vi.fn();
    h.logout = vi.fn();
    h.deleteUserMock = vi.fn(async (_id: number) => {});
    h.lastFormUser = null;
  });

  it("muestra spinner cuando loading y no hay datos", () => {
    h.loading = true;
    h.profile = null;

    render(<ProfileSection />);

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    expect(screen.queryByTestId("profile-form")).not.toBeInTheDocument();
  });

  it("sincroniza el form con profile al montar y al cambiar profile (si NO está en edición)", () => {
    h.profile = { id: 1, name: "Juan", email: "juan@x.com" };

    const { rerender } = render(<ProfileSection />);

    // al montar: form toma el profile
    expect(h.lastFormUser).toMatchObject({ name: "Juan", email: "juan@x.com" });

    // cambia profile y NO estamos en edición -> debe reflejarse
    h.profile = { id: 1, name: "Juana", email: "juana@x.com" };
    rerender(<ProfileSection />);
    expect(h.lastFormUser).toMatchObject({ name: "Juana", email: "juana@x.com" });
  });

  it("toggle edición: entra/sale, llama updateProfile y mergea el resultado", async () => {
    h.profile = { id: 1, name: "Ana", email: "ana@x.com" };
    // el hook devuelve un parche a mergear
    h.updateProfile = vi.fn(async (_u: any) => ({ email: "merged@x.com" }));

    render(<ProfileSection />);

    // entra en edición
    fireEvent.click(screen.getByLabelText("toggle-edit"));
    expect(screen.getByTestId("pv-edit-flag")).toBeInTheDocument();

    // modifica desde el form
    fireEvent.click(screen.getByLabelText("set-name"));
    fireEvent.click(screen.getByLabelText("set-email"));

    // sale de edición (dispara updateProfile y merge)
    fireEvent.click(screen.getByLabelText("toggle-edit"));

    await waitFor(() => {
      expect(h.updateProfile).toHaveBeenCalledTimes(1);
    });

    // Luego del merge, el form debe tener el email del parche
    expect(h.lastFormUser).toMatchObject({
      name: "Nuevo Nombre",
      email: "merged@x.com",
    });

    // ya no está en edición
    expect(screen.queryByTestId("pv-edit-flag")).not.toBeInTheDocument();
  });

  it("colapsa y expande con los botones 'Ocultar perfil' y 'Mostrar perfil'", () => {
    h.profile = { id: 1, name: "Luz", email: "luz@x.com" };

    render(<ProfileSection />);

    // Ocultar
    fireEvent.click(screen.getByRole("button", { name: /Ocultar perfil/i }));

    // aparece barra con 'Mostrar perfil'
    const showBtn = screen.getByRole("button", { name: /Mostrar perfil/i });
    expect(showBtn).toBeInTheDocument();

    // Expandir
    fireEvent.click(showBtn);
    expect(screen.getByTestId("profile-view")).toBeInTheDocument();
    expect(screen.getByTestId("profile-form")).toBeInTheDocument();
  });

  it("eliminar perfil: sin info muestra alerta específica y no llama deleteUser", async () => {
    h.info = null;
    h.profile = { id: 1, name: "A", email: "a@x.com" };

    render(<ProfileSection />);

    fireEvent.click(screen.getByLabelText("delete-profile"));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "No hay información de usuario. No puedes eliminar el perfil."
      );
    });
    expect(h.deleteUserMock).not.toHaveBeenCalled();
    expect(h.setInfo).not.toHaveBeenCalled();
    expect(h.logout).not.toHaveBeenCalled();
  });

  it("eliminar perfil: error con response.data → alerta detallada", async () => {
    h.info = { id: 77 };
    h.profile = { id: 77, name: "C", email: "c@x.com" };
    h.deleteUserMock = vi.fn(async () => {
      const err: any = new Error("boom");
      err.response = { data: "No se pudo" };
      throw err;
    });

    render(<ProfileSection />);

    fireEvent.click(screen.getByLabelText("delete-profile"));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Error: No se pudo");
    });
  });
});
