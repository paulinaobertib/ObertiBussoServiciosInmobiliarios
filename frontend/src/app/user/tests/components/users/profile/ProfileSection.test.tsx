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
  let handleErrorMock: any;
  let logoutMock: any;
  let setInfoMock: any;
  let successMock: any;
  let doubleConfirmMock: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    handleErrorMock = vi.fn();
    logoutMock = vi.fn();
    setInfoMock = vi.fn();
    successMock = vi.fn();
    doubleConfirmMock = vi.fn().mockResolvedValue(true);

    (useProfile as any).mockReturnValue({
      profile: fakeUser,
      loading: false,
      updateProfile: vi.fn().mockResolvedValue({ firstName: "NuevoNombre" }),
    });

    const { useAuthContext } = await import("../../../../context/AuthContext");
    (useAuthContext as any).mockReturnValue({
      info: fakeUser,
      logout: logoutMock,
      setInfo: setInfoMock,
    });

    (useGlobalAlert as any).mockReturnValue({
      success: successMock,
      doubleConfirm: doubleConfirmMock,
    });

    (useApiErrors as any).mockReturnValue({
      handleError: handleErrorMock,
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

  it("no elimina si el usuario cancela la confirmación", async () => {
    doubleConfirmMock.mockResolvedValueOnce(false);
    render(<ProfileSection />);

    fireEvent.click(screen.getByRole("button", { name: /Editar perfil/i }));
    fireEvent.click(screen.getByLabelText("Eliminar mi cuenta"));

    await waitFor(() => {
      expect(deleteUser).not.toHaveBeenCalled();
    });
  });

  it("elimina perfil cuando hay confirmación e info válida", async () => {
    render(<ProfileSection />);
    fireEvent.click(screen.getByRole("button", { name: /Editar perfil/i }));
    fireEvent.click(screen.getByLabelText("Eliminar mi cuenta"));

    await waitFor(() => expect(deleteUser).toHaveBeenCalledWith(fakeUser.id));
    expect(setInfoMock).toHaveBeenCalledWith(null);
    expect(successMock).toHaveBeenCalledWith({ title: "Cuenta eliminada", description: undefined, primaryLabel: "Ok" });
    expect(logoutMock).toHaveBeenCalled();
  });

  it("el botón alterna entre 'Editar perfil' y 'Guardar perfil' y guarda en la segunda pulsación", async () => {
    render(<ProfileSection />);
    const toggleButton = screen.getByRole("button", { name: /Editar perfil/i });
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveTextContent(/Guardar perfil/i);

    fireEvent.click(toggleButton);
    await waitFor(() => {
      expect(useProfile().updateProfile).toHaveBeenCalled();
    });
    expect(toggleButton).toHaveTextContent(/Editar perfil/i);
  });
});
