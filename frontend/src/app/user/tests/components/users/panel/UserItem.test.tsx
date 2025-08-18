/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UserItem } from "../../../../components/users/panel/UserItem";
import type { User, Role } from "../../../../types/user";

describe("<UserItem />", () => {
  const mockUser: User = {
    id: "u1",
    userName: "usuario1",
    email: "test@example.com",
    firstName: "Nombre",
    lastName: "Apellido",
    phone: "1234567890",
    roles: ["admin", "user"] as Role[],
  };

  const toggleSelectMock = vi.fn();
  const isSelectedMock = vi.fn().mockReturnValue(false);
  const onEditMock = vi.fn();
  const onDeleteMock = vi.fn();
  const onRolesMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza los datos del usuario correctamente", () => {
    render(<UserItem user={mockUser} />);
    const nameElems = screen.getAllByText(/Nombre Apellido/);
    expect(nameElems[0]).toBeInTheDocument();

    const emailElems = screen.getAllByText(mockUser.email);
    expect(emailElems[0]).toBeInTheDocument();

    const phoneElems = screen.getAllByText(mockUser.phone);
    expect(phoneElems[0]).toBeInTheDocument();

    const rolesElems = screen.getAllByText("Administrador, Usuario");
    expect(rolesElems[0]).toBeInTheDocument();
  });

  it("llama toggleSelect al hacer click si está habilitado", () => {
    render(<UserItem user={mockUser} toggleSelect={toggleSelectMock} isSelected={isSelectedMock} />);
    const nameElems = screen.getAllByText(/Nombre Apellido/);
    fireEvent.click(nameElems[0]);
    expect(toggleSelectMock).toHaveBeenCalledWith(mockUser.id);
  });

  it("no llama toggleSelect si no está habilitado", () => {
    render(<UserItem user={mockUser} />);
    const nameElems = screen.getAllByText(/Nombre Apellido/);
    fireEvent.click(nameElems[0]);
    expect(toggleSelectMock).not.toHaveBeenCalled();
  });

  it("llama onEdit al hacer click en el botón editar", () => {
    render(<UserItem user={mockUser} onEdit={onEditMock} />);
    fireEvent.click(screen.getByRole("button", { name: /Editar/i }));
    expect(onEditMock).toHaveBeenCalledWith(mockUser);
  });

  it("llama onDelete al hacer click en el botón eliminar", () => {
    render(<UserItem user={mockUser} onDelete={onDeleteMock} />);
    fireEvent.click(screen.getByRole("button", { name: /Eliminar/i }));
    expect(onDeleteMock).toHaveBeenCalledWith(mockUser);
  });

  it("llama onRoles al hacer click en el botón roles", () => {
    render(<UserItem user={mockUser} onRoles={onRolesMock} />);
    fireEvent.click(screen.getByRole("button", { name: /Roles/i }));
    expect(onRolesMock).toHaveBeenCalledWith(mockUser);
  });

  it("muestra el fondo de selección cuando isSelected devuelve true", () => {
    isSelectedMock.mockReturnValue(true);
    const { container } = render(<UserItem user={mockUser} toggleSelect={toggleSelectMock} isSelected={isSelectedMock} />);
    const box = container.firstChild as HTMLElement;
    expect(box.style.backgroundColor).not.toBe("transparent");
  });
});
