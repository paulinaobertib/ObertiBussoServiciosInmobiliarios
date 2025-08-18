/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UsersList } from "../../../../components/users/panel/UsersList";
import type { User, Role } from "../../../../types/user";

const mockUsers: (User & { roles: Role[] })[] = [
  {
    id: "u1",
    userName: "usuario1",
    email: "user1@test.com",
    firstName: "Nombre1",
    lastName: "Apellido1",
    phone: "1111111111",
    roles: ["admin", "user"],
  },
  {
    id: "u2",
    userName: "usuario2",
    email: "user2@test.com",
    firstName: "Nombre2",
    lastName: "Apellido2",
    phone: "2222222222",
    roles: ["user"],
  },
];

describe("<UsersList />", () => {
  const onEditMock = vi.fn();
  const onDeleteMock = vi.fn();
  const onRolesMock = vi.fn();
  const toggleSelectMock = vi.fn();
  const isSelectedMock = vi.fn().mockReturnValue(false);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza todos los usuarios", () => {
    render(
      <UsersList
        users={mockUsers}
        onEdit={onEditMock}
        onDelete={onDeleteMock}
        onRoles={onRolesMock}
      />
    );

    expect(screen.getAllByText(/Nombre1 Apellido1/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Nombre2 Apellido2/)[0]).toBeInTheDocument();
  });

  it("pasa correctamente las acciones y selección a UserItem", () => {
    render(
      <UsersList
        users={mockUsers}
        onEdit={onEditMock}
        onDelete={onDeleteMock}
        onRoles={onRolesMock}
        toggleSelect={toggleSelectMock}
        isSelected={isSelectedMock}
      />
    );

    const nameElems = screen.getAllByText(/Nombre1 Apellido1/);
    fireEvent.click(nameElems[0]);
    expect(toggleSelectMock).toHaveBeenCalledWith("u1");
  });

  it("no pasa acciones a UserItem si showActions=false", () => {
    render(
      <UsersList
        users={mockUsers}
        onEdit={onEditMock}
        onDelete={onDeleteMock}
        onRoles={onRolesMock}
        showActions={false}
      />
    );

    expect(screen.queryByRole("button", { name: /Editar/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Eliminar/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Roles/i })).toBeNull();
  });
});
