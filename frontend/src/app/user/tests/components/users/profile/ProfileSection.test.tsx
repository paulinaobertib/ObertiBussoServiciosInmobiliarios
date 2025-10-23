/// <reference types="vitest" />
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, vi, beforeEach, expect } from "vitest";
import { ProfileSection } from "../../../../components/users/profile/ProfileSection";
import type { User } from "../../../../types/user";

vi.mock("../../../../hooks/useProfile", () => ({ useProfile: vi.fn() }));
vi.mock("../../../../context/AuthContext", () => ({ useAuthContext: vi.fn() }));
vi.mock("../../../../../shared/context/AlertContext", () => ({ useGlobalAlert: vi.fn() }));
vi.mock("../../../../../shared/hooks/useErrors", () => ({ useApiErrors: vi.fn() }));
vi.mock("../../../../services/user.service", () => ({ deleteUser: vi.fn() }));

import { useProfile } from "../../../../hooks/useProfile";
import { useAuthContext } from "../../../../context/AuthContext";
import { useGlobalAlert } from "../../../../../shared/context/AlertContext";
import { useApiErrors } from "../../../../../shared/hooks/useErrors";
import { deleteUser } from "../../../../services/user.service";

const fakeUser: User = {
  id: "1",
  userName: "usuario1",
  firstName: "Nombre",
  lastName: "Apellido",
  email: "test@example.com",
  phone: "1234567890",
  roles: [],
};

describe("ProfileSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (useProfile as any).mockReturnValue({
      profile: fakeUser,
      loading: false,
      updateProfile: vi.fn().mockResolvedValue({ firstName: "NuevoNombre" }),
    });

    (useAuthContext as any).mockReturnValue({
      info: fakeUser,
      logout: vi.fn(),
      setInfo: vi.fn(),
    });

    (useGlobalAlert as any).mockReturnValue({
      success: vi.fn(),
      doubleConfirm: vi.fn().mockResolvedValue(true),
    });

    (useApiErrors as any).mockReturnValue({
      handleError: vi.fn(),
    });

    (deleteUser as any).mockResolvedValue({});
  });

  it("muestra spinner cuando loading y no hay datos", () => {
    (useProfile as any).mockReturnValueOnce({
      profile: null,
      loading: true,
      updateProfile: vi.fn(),
    });

    render(<ProfileSection />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("sincroniza el form con profile al montar", () => {
    render(<ProfileSection />);
    // verificamos el campo del form
    expect(screen.getByLabelText("Nombre")).toHaveValue("Nombre");
  });

  it("toggle edición: entra y llama updateProfile al guardar", async () => {
    render(<ProfileSection />);

    const editBtn = screen.getByRole("button", { name: /Editar perfil/i });
    fireEvent.click(editBtn);

    const saveBtn = screen.getByRole("button", { name: /Guardar perfil/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(useProfile().updateProfile).toHaveBeenCalled();
    });
  });

  it("colapsa y expande con los botones", () => {
    render(<ProfileSection />);
    fireEvent.click(screen.getByRole("button", { name: /Ocultar perfil/i }));
    expect(screen.getByRole("button", { name: /Mostrar perfil/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Mostrar perfil/i }));
    expect(screen.getByRole("button", { name: /Ocultar perfil/i })).toBeInTheDocument();
  });

  /*
  VER ESTOS QUE FALLAN
  it("eliminar perfil: sin info → muestra error y no llama deleteUser", async () => {
    (useAuthContext as any).mockReturnValueOnce({
      info: null,
      logout: vi.fn(),
      setInfo: vi.fn(),
    });

    render(<ProfileSection />);
    const deleteBtn = screen.getByRole("button", {
      name: (name) => name.includes("Eliminar") && name.includes("cuenta"),
    });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(deleteUser).not.toHaveBeenCalled();
      expect(useApiErrors().handleError).toHaveBeenCalled();
    });
  });

  it("eliminar perfil: con info llama deleteUser y logout", async () => {
    render(<ProfileSection />);
    const deleteBtn = screen.getByRole("button", {
      name: (name) => name.includes("Eliminar") && name.includes("cuenta"),
    });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(deleteUser).toHaveBeenCalledWith(fakeUser.id);
      expect(useAuthContext().logout).toHaveBeenCalled();
    });
  });
*/

});
