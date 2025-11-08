/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RoleForm, type RoleFormProps } from "../../../../components/users/panel/RoleForm";
import { useGlobalAlert } from "../../../../../shared/context/AlertContext";
import { addRoleToUser, deleteRoleFromUser, getRoles } from "../../../../services/user.service";

vi.mock("../../../../../shared/context/AlertContext", () => ({
  useGlobalAlert: vi.fn(),
}));

vi.mock("../../../../services/user.service", () => ({
  addRoleToUser: vi.fn(),
  deleteRoleFromUser: vi.fn(),
  getRoles: vi.fn(),
}));

const showAlertMock = vi.fn();

const baseProps: RoleFormProps = {
  userId: "u1",
  currentRoles: [],
  onSuccess: vi.fn(),
  onClose: vi.fn(),
};

describe("<RoleForm />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useGlobalAlert as any).mockReturnValue({ showAlert: showAlertMock });

    (getRoles as any).mockResolvedValue({ data: ["admin", "user", "tenant"] });

    (addRoleToUser as any).mockResolvedValue({});
    (deleteRoleFromUser as any).mockResolvedValue({});
  });

  it("renderiza título y Autocomplete (combobox)", () => {
    render(<RoleForm {...baseProps} />);
    expect(screen.getByText(/selecciona roles/i)).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("inicializa roles con currentRoles si vienen dados", () => {
    render(<RoleForm {...baseProps} currentRoles={["admin"]} />);
    expect(screen.getByText(/Administrador/i)).toBeInTheDocument();
  });

  it("hace fetch de roles si currentRoles está vacío", async () => {
    render(<RoleForm {...baseProps} />);
    await waitFor(() => {
      expect(getRoles).toHaveBeenCalledWith("u1");
    });
  });

  it("llama a addRoleToUser (y opcionalmente deleteRoleFromUser) al guardar cambios", async () => {
    // Partimos de "user" y agregamos "admin"
    render(<RoleForm {...baseProps} currentRoles={["user"]} />);

    const combo = screen.getByRole("combobox");

    // Abrimos el panel de opciones del Autocomplete
    fireEvent.mouseDown(combo);

    const opcionAdmin = await screen.findByRole("option", { name: /Administrador/i });
    fireEvent.click(opcionAdmin);

    const guardar = screen.getByRole("button", { name: /guardar roles/i });
    fireEvent.click(guardar);

    await waitFor(() => {
      expect(addRoleToUser).toHaveBeenCalledWith("u1", "admin");
      // Si tu implementación también elimina roles, podrías verificar:
      // expect(deleteRoleFromUser).toHaveBeenCalledWith('u1', 'user');
    });

    // onSuccess es parte de props
    expect(baseProps.onSuccess).toHaveBeenCalled();
  });

  it("deshabilita botón guardar si no hay cambios", () => {
    render(<RoleForm {...baseProps} currentRoles={["user"]} />);
    const btn = screen.getByRole("button", { name: /guardar roles/i });
    expect(btn).toBeDisabled();
  });

  it("habilita botón guardar si hay cambios (seleccionar otro rol)", async () => {
    render(<RoleForm {...baseProps} currentRoles={["user"]} />);

    const combo = screen.getByRole("combobox");
    fireEvent.mouseDown(combo);

    const opcionAdmin = await screen.findByRole("option", { name: /Administrador/i });
    fireEvent.click(opcionAdmin);

    const btn = screen.getByRole("button", { name: /guardar roles/i });
    expect(btn).not.toBeDisabled();
  });
});
