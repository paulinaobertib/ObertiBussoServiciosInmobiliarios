import { render, screen, fireEvent } from "@testing-library/react";
import { vi, Mock } from "vitest";
import { OwnerForm } from "../../../components/forms/OwnerForm";
import { useCategories } from "../../../hooks/useCategories";
import { usePropertiesContext } from "../../../context/PropertiesContext";
import { postOwner, putOwner, deleteOwner } from "../../../services/owner.service";

vi.mock("../../../hooks/useCategories");
vi.mock("../../../context/PropertiesContext");
vi.mock("../../../services/owner.service");

describe("OwnerForm", () => {
  const mockRun = vi.fn();
  const mockSetForm = vi.fn();
  const mockOnDone = vi.fn();

  const baseForm = {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "12345",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (usePropertiesContext as Mock).mockReturnValue({ refreshOwners: vi.fn() });
    (useCategories as Mock).mockReturnValue({
      form: baseForm,
      setForm: mockSetForm,
      invalid: false,
      run: mockRun,
      loading: false,
    });
  });

  it("renderiza campos para add/edit", () => {
    render(<OwnerForm action="add" onDone={mockOnDone} />);
    expect(screen.getByLabelText("Nombre")).toBeInTheDocument();
    expect(screen.getByLabelText("Apellido")).toBeInTheDocument();
    expect(screen.getByLabelText("Mail")).toBeInTheDocument();
    expect(screen.getByLabelText("Teléfono")).toBeInTheDocument();
  });

  it("deshabilita campos en delete", () => {
    render(<OwnerForm action="delete" item={baseForm} onDone={mockOnDone} />);
    expect(screen.getByLabelText("Nombre")).toBeDisabled();
    expect(screen.getByLabelText("Apellido")).toBeDisabled();
    expect(screen.getByLabelText("Mail")).toBeDisabled();
    expect(screen.getByLabelText("Teléfono")).toBeDisabled();
  });

  it("llama a setForm cuando se cambian los campos", () => {
    render(<OwnerForm action="edit" item={baseForm} onDone={mockOnDone} />);
    const input = screen.getByLabelText("Nombre") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Jane" } });
    expect(mockSetForm).toHaveBeenCalledWith({ ...baseForm, firstName: "Jane" });
  });

  it("muestra botón Confirmar en add/edit", () => {
    render(<OwnerForm action="add" onDone={mockOnDone} />);
    expect(screen.getByRole("button", { name: /Confirmar/i })).toBeInTheDocument();
  });

  it("muestra botón Eliminar en delete", () => {
    render(<OwnerForm action="delete" item={baseForm} onDone={mockOnDone} />);
    expect(screen.getByRole("button", { name: /Eliminar/i })).toBeInTheDocument();
  });

  it("ejecuta run al hacer clic en el botón", () => {
    render(<OwnerForm action="add" onDone={mockOnDone} />);
    fireEvent.click(screen.getByRole("button", { name: /Confirmar/i }));
    expect(mockRun).toHaveBeenCalled();
  });

  it("usa el servicio correcto según la acción", async () => {
    (postOwner as Mock).mockResolvedValue({ id: 1 });
    (putOwner as Mock).mockResolvedValue({ id: 1 });
    (deleteOwner as Mock).mockResolvedValue({ id: 1 });

    render(<OwnerForm action="add" onDone={mockOnDone} />);
    await (useCategories as Mock).mock.calls[0][0].save(baseForm);
    expect(postOwner).toHaveBeenCalled();

    render(<OwnerForm action="edit" item={baseForm} onDone={mockOnDone} />);
    await (useCategories as Mock).mock.calls[1][0].save(baseForm);
    expect(putOwner).toHaveBeenCalled();

    render(<OwnerForm action="delete" item={baseForm} onDone={mockOnDone} />);
    await (useCategories as Mock).mock.calls[2][0].save(baseForm);
    expect(deleteOwner).toHaveBeenCalled();
  });

it("muestra overlay de carga cuando loading=true", () => {
  (useCategories as Mock).mockReturnValue({
    form: baseForm,
    setForm: mockSetForm,
    invalid: false,
    run: mockRun,
    loading: true,
  });

  render(<OwnerForm action="add" onDone={mockOnDone} />);
  
  const overlay = screen.getByTestId("overlay");
  expect(overlay).toBeInTheDocument();
});

it("deshabilita botón cuando loading=true", () => {
  (useCategories as Mock).mockReturnValue({
    form: baseForm,
    setForm: mockSetForm,
    invalid: false,
    run: mockRun,
    loading: true,
  });

  render(<OwnerForm action="add" onDone={mockOnDone} />);
  
  const button = screen.getByRole("button", { name: /Confirmar/i });
  expect(button).toBeDisabled();
});

it("deshabilita botón cuando invalid=true", () => {
  (useCategories as Mock).mockReturnValue({
    form: baseForm,
    setForm: mockSetForm,
    invalid: true,
    run: mockRun,
    loading: false,
  });

  render(<OwnerForm action="add" onDone={mockOnDone} />);
  
  const button = screen.getByRole("button", { name: /Confirmar/i });
  expect(button).toBeDisabled();
});

it("actualiza todos los campos correctamente al escribir", () => {
  const setFormMock = vi.fn();
  (useCategories as Mock).mockReturnValue({
    form: { ...baseForm },
    setForm: setFormMock,
    invalid: false,
    run: mockRun,
    loading: false,
  });

  render(<OwnerForm action="edit" item={baseForm} onDone={mockOnDone} />);

  fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Jane" } });
  fireEvent.change(screen.getByLabelText("Apellido"), { target: { value: "Smith" } });
  fireEvent.change(screen.getByLabelText("Mail"), { target: { value: "jane@example.com" } });
  fireEvent.change(screen.getByLabelText("Teléfono"), { target: { value: "67890" } });

  expect(setFormMock).toHaveBeenCalledWith(expect.objectContaining({ firstName: "Jane" }));
  expect(setFormMock).toHaveBeenCalledWith(expect.objectContaining({ lastName: "Smith" }));
  expect(setFormMock).toHaveBeenCalledWith(expect.objectContaining({ email: "jane@example.com" }));
  expect(setFormMock).toHaveBeenCalledWith(expect.objectContaining({ phone: "67890" }));
});

});
