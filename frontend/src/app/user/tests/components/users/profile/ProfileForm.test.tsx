import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, vi, expect } from "vitest";
import { ProfileForm } from "../../../../components/users/profile/ProfileForm";
import type { User } from "../../../../types/user";

describe("ProfileForm", () => {
  const mockUser: User = {
    id: "1",
    userName: "usuario1",
    firstName: "Nombre",
    lastName: "Apellido",
    email: "test@example.com",
    phone: "1234567890",
    roles: [],
  };

  const onChangeMock = vi.fn();

  it("renderiza todos los campos con valores iniciales", () => {
    render(<ProfileForm user={mockUser} editMode={true} onChange={onChangeMock} />);

    const labels = [
      "Nombre de usuario",
      "Nombre",
      "Apellido",
      "Correo electrónico",
      "Teléfono",
    ];

    labels.forEach((label) => {
      const input = screen.getByLabelText(label) as HTMLInputElement;
      expect(input).toBeInTheDocument();
    });

    expect(screen.getByLabelText("Nombre de usuario")).toHaveValue("usuario1");
    expect(screen.getByLabelText("Nombre")).toHaveValue("Nombre");
    expect(screen.getByLabelText("Apellido")).toHaveValue("Apellido");
    expect(screen.getByLabelText("Correo electrónico")).toHaveValue("test@example.com");
    expect(screen.getByLabelText("Teléfono")).toHaveValue("1234567890");
  });

  it("deshabilita campos según editMode", () => {
    render(<ProfileForm user={mockUser} editMode={false} onChange={onChangeMock} />);

    const labels = [
      "Nombre de usuario",
      "Nombre",
      "Apellido",
      "Correo electrónico",
      "Teléfono",
    ];

    labels.forEach((label) => {
      const input = screen.getByLabelText(label) as HTMLInputElement;
      expect(input).toBeDisabled();
    });
  });

  it("campo Nombre de usuario siempre deshabilitado aunque editMode sea true", () => {
    render(<ProfileForm user={mockUser} editMode={true} onChange={onChangeMock} />);
    const userNameInput = screen.getByLabelText("Nombre de usuario") as HTMLInputElement;
    expect(userNameInput).toBeDisabled();
  });

  it("llama onChange al modificar campos editables", () => {
    render(<ProfileForm user={mockUser} editMode={true} onChange={onChangeMock} />);

    const firstNameInput = screen.getByLabelText("Nombre") as HTMLInputElement;
    fireEvent.change(firstNameInput, { target: { value: "NuevoNombre" } });

    expect(onChangeMock).toHaveBeenCalledWith("firstName", "NuevoNombre");
  });
});
