import { render, screen, fireEvent } from "@testing-library/react";
import { vi, Mock } from "vitest";
import { TypeForm } from "../../../components/forms/TypeForm";
import { useCategories } from "../../../hooks/useCategories";
import { usePropertiesContext } from "../../../context/PropertiesContext";
import { postType, putType, deleteType } from "../../../services/type.service";

vi.mock("../../../hooks/useCategories");
vi.mock("../../../context/PropertiesContext");
vi.mock("../../../services/type.service");

describe("TypeForm", () => {
  const mockRun = vi.fn();
  const mockSetForm = vi.fn();
  const mockOnDone = vi.fn();

  const baseForm = {
    id: 1,
    name: "Casa",
    hasRooms: true,
    hasBathrooms: true,
    hasBedrooms: false,
    hasCoveredArea: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (usePropertiesContext as Mock).mockReturnValue({ refreshTypes: vi.fn() });
    (useCategories as Mock).mockReturnValue({
      form: baseForm,
      setForm: mockSetForm,
      invalid: false,
      run: mockRun,
      loading: false,
    });
  });

  it("renderiza campos de texto y checkboxes", () => {
    render(<TypeForm action="add" onDone={mockOnDone} />);
    expect(screen.getByLabelText("Nombre")).toBeInTheDocument();
    expect(screen.getByLabelText("Ambientes")).toBeInTheDocument();
    expect(screen.getByLabelText("Dormitorios")).toBeInTheDocument();
    expect(screen.getByLabelText("Baños")).toBeInTheDocument();
    expect(screen.getByLabelText("Superficie cubierta")).toBeInTheDocument();
  });

  it("deshabilita campos en delete", () => {
    render(<TypeForm action="delete" item={baseForm} onDone={mockOnDone} />);
    expect(screen.getByLabelText("Nombre")).toBeDisabled();
    expect(screen.getByLabelText("Ambientes")).toBeDisabled();
    expect(screen.getByLabelText("Dormitorios")).toBeDisabled();
    expect(screen.getByLabelText("Baños")).toBeDisabled();
    expect(screen.getByLabelText("Superficie cubierta")).toBeDisabled();
  });

  it("llama a setForm al cambiar el campo Nombre", () => {
    render(<TypeForm action="edit" item={baseForm} onDone={mockOnDone} />);
    const input = screen.getByLabelText("Nombre") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Departamento" } });
    expect(mockSetForm).toHaveBeenCalledWith({
      ...baseForm,
      name: "Departamento",
    });
  });

  it("llama a setForm al cambiar un checkbox", () => {
    render(<TypeForm action="edit" item={baseForm} onDone={mockOnDone} />);
    const checkbox = screen.getByLabelText("Dormitorios") as HTMLInputElement;
    fireEvent.click(checkbox);
    expect(mockSetForm).toHaveBeenCalledWith({
      ...baseForm,
      hasBedrooms: !baseForm.hasBedrooms,
    });
  });

  it("muestra botón Confirmar en add/edit", () => {
    render(<TypeForm action="add" onDone={mockOnDone} />);
    expect(screen.getByRole("button", { name: /Confirmar/i })).toBeInTheDocument();
  });

  it("muestra botón Eliminar en delete", () => {
    render(<TypeForm action="delete" item={baseForm} onDone={mockOnDone} />);
    expect(screen.getByRole("button", { name: /Eliminar/i })).toBeInTheDocument();
  });

  it("ejecuta run al hacer clic en el botón", () => {
    render(<TypeForm action="add" onDone={mockOnDone} />);
    fireEvent.click(screen.getByRole("button", { name: /Confirmar/i }));
    expect(mockRun).toHaveBeenCalled();
  });

  it("usa el servicio correcto según la acción", async () => {
    (postType as Mock).mockResolvedValue({ id: 1 });
    (putType as Mock).mockResolvedValue({ id: 1 });
    (deleteType as Mock).mockResolvedValue({ id: 1 });

    render(<TypeForm action="add" onDone={mockOnDone} />);
    await (useCategories as Mock).mock.calls[0][0].save(baseForm);
    expect(postType).toHaveBeenCalled();

    render(<TypeForm action="edit" item={baseForm} onDone={mockOnDone} />);
    await (useCategories as Mock).mock.calls[1][0].save(baseForm);
    expect(putType).toHaveBeenCalled();

    render(<TypeForm action="delete" item={baseForm} onDone={mockOnDone} />);
    await (useCategories as Mock).mock.calls[2][0].save(baseForm);
    expect(deleteType).toHaveBeenCalled();
  });
});
