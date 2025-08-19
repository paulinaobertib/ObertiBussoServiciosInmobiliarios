import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, vi } from "vitest";
import { ProfileForm } from "../../../../components/users/profile/ProfileForm";
import type { User } from "../../../../types/user";

describe("ProfileForm", () => {
    const mockUser: User = {
    id: "1",               // <-- cambiar a string
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

    const fields: (keyof User)[] = ["userName", "firstName", "lastName", "email", "phone"];
    fields.forEach(field => {
      const input = screen.getByLabelText(field as string) as HTMLInputElement;
      expect(input).toBeInTheDocument();
      expect(input.value).toBe(mockUser[field] || "");
    });
  });

  it("deshabilita campos según editMode", () => {
    render(<ProfileForm user={mockUser} editMode={false} onChange={onChangeMock} />);
    
    const fields: (keyof User)[] = ["userName", "firstName", "lastName", "email", "phone"];
    fields.forEach(field => {
      const input = screen.getByLabelText(field as string) as HTMLInputElement;
      expect(input).toBeDisabled();
    });
  });

  it("campo userName siempre deshabilitado aunque editMode sea true", () => {
    render(<ProfileForm user={mockUser} editMode={true} onChange={onChangeMock} />);
    const userNameInput = screen.getByLabelText("userName") as HTMLInputElement;
    expect(userNameInput).toBeDisabled();
  });

  it("llama onChange al modificar campos editables", () => {
    render(<ProfileForm user={mockUser} editMode={true} onChange={onChangeMock} />);
    
    const firstNameInput = screen.getByLabelText("firstName") as HTMLInputElement;
    fireEvent.change(firstNameInput, { target: { value: "NuevoNombre" } });

    expect(onChangeMock).toHaveBeenCalledWith("firstName", "NuevoNombre");
  });
});
