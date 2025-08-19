/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProfileView } from "../../../../components/users/profile/ProfileView";
import type { User } from "../../../../types/user";

const baseUser: User = {
  id: "u1",
  firstName: "Juan",
  lastName: "Pérez",
  email: "juan@example.com",
  phone: "123456789",
} as any;

describe("<ProfileView />", () => {
  let onToggleEdit: ReturnType<typeof vi.fn>;
  let onDeleteProfile: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onToggleEdit = vi.fn();
    onDeleteProfile = vi.fn();
  });

  it("renderiza nombre, email y teléfono", () => {
    render(
      <ProfileView
        user={baseUser}
        editMode={false}
        saving={false}
        onToggleEdit={onToggleEdit}
        onDeleteProfile={onDeleteProfile}
      />
    );

    expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    expect(screen.getByText("juan@example.com")).toBeInTheDocument();
    expect(screen.getByText("123456789")).toBeInTheDocument();
  });

  it("muestra las iniciales en el Avatar (en mayúsculas)", () => {
    render(
      <ProfileView
        user={baseUser}
        editMode={false}
        saving={false}
        onToggleEdit={onToggleEdit}
      />
    );

    expect(screen.getByText("JP")).toBeInTheDocument();
  });

  it("el botón 'Eliminar mi cuenta' dispara onDeleteProfile si se provee", () => {
    render(
      <ProfileView
        user={baseUser}
        editMode={false}
        saving={false}
        onToggleEdit={onToggleEdit}
        onDeleteProfile={onDeleteProfile}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /eliminar mi cuenta/i }));
    expect(onDeleteProfile).toHaveBeenCalledTimes(1);
  });

  it("soporta valores faltantes: sin lastName, renderiza inicial solo del firstName", () => {
    const userSinApellido = { ...baseUser, firstName: "ana", lastName: "" };
    render(
      <ProfileView
        user={userSinApellido}
        editMode={false}
        saving={false}
        onToggleEdit={onToggleEdit}
      />
    );

    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("ana")).toBeInTheDocument();
  });

  it("no rompe si no se pasa onDeleteProfile", () => {
    render(
      <ProfileView
        user={baseUser}
        editMode={false}
        saving={false}
        onToggleEdit={onToggleEdit}
      />
    );

    const button = screen.getByRole("button", { name: /eliminar mi cuenta/i });
    fireEvent.click(button); // no debería lanzar error
  });

  it("muestra EditIcon cuando editMode es false", () => {
    render(
        <ProfileView
        user={baseUser}
        editMode={false}
        saving={false}
        onToggleEdit={onToggleEdit}
        />
    );

    const editButton = screen.getByRole("button", { name: /edit/i });
    expect(editButton).toBeInTheDocument();
    });

    it("muestra SaveIcon cuando editMode es true", () => {
    render(
        <ProfileView
        user={baseUser}
        editMode={true}
        saving={false}
        onToggleEdit={onToggleEdit}
        />
    );

    const saveButton = screen.getByRole("button", { name: /save/i });
    expect(saveButton).toBeInTheDocument();
    });

    it("deshabilita el botón de edición cuando saving es true", () => {
    render(
        <ProfileView
        user={baseUser}
        editMode={false}
        saving={true}
        onToggleEdit={onToggleEdit}
        />
    );

    const editButton = screen.getByRole("button", { name: /edit/i });
    expect(editButton).toBeDisabled();
    });

    it("llama a onToggleEdit al hacer click en el botón de edición", () => {
    render(
        <ProfileView
        user={baseUser}
        editMode={false}
        saving={false}
        onToggleEdit={onToggleEdit}
        />
    );

    const editButton = screen.getByRole("button", { name: /edit/i });
    fireEvent.click(editButton);
    expect(onToggleEdit).toHaveBeenCalledTimes(1);
    });

});
