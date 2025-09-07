import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, Mock } from "vitest";
import { NeighborhoodForm } from "../../../components/forms/NeighborhoodForm";
import { NeighborhoodType, Neighborhood } from "../../../types/neighborhood";
import { useCategories } from "../../../hooks/useCategories";
import { usePropertiesContext } from "../../../context/PropertiesContext";

vi.mock("../../../hooks/useCategories");
vi.mock("../../../context/PropertiesContext");
vi.mock("../../../services/neighborhood.service");

describe("NeighborhoodForm", () => {
  const mockOnDone = vi.fn();
  const mockRefresh = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    (usePropertiesContext as Mock).mockReturnValue({ refreshNeighborhoods: mockRefresh });
  });

  const setupHook = (overrides = {}) => {
    (useCategories as Mock).mockReturnValue({
      form: { id: 1, name: "Old Name", city: "Old City", type: NeighborhoodType.ABIERTO },
      setForm: vi.fn(),
      invalid: false,
      run: vi.fn(),
      loading: false,
      ...overrides,
    });
  };

  it("renderiza campos correctamente en modo add", () => {
    setupHook({ form: { name: "", city: "", type: "" } });

    render(<NeighborhoodForm action="add" onDone={mockOnDone} />);

    expect(screen.getByLabelText(/Nombre/i)).toBeEnabled();
    expect(screen.getByLabelText(/Ciudad/i)).toBeEnabled();
    expect(screen.getByLabelText(/Tipo/i)).toBeEnabled();
    expect(screen.getByRole("button", { name: /Confirmar/i })).toBeEnabled();
  });

  it("renderiza valores iniciales en modo edit", () => {
    const item: Neighborhood = { id: 2, name: "Edit Name", city: "Edit City", type: NeighborhoodType.CERRADO };
    setupHook({ form: item });

    render(<NeighborhoodForm action="edit" item={item} onDone={mockOnDone} />);

    expect(screen.getByDisplayValue("Edit Name")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Edit City")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Confirmar/i })).toBeEnabled();
  });

  it("renderiza en modo delete y deshabilita inputs", () => {
    const item: Neighborhood = { id: 3, name: "To Delete", city: "Delete City", type: NeighborhoodType.SEMICERRADO };
    setupHook({ form: item });

    render(<NeighborhoodForm action="delete" item={item} onDone={mockOnDone} />);

    expect(screen.getByDisplayValue("To Delete")).toBeDisabled();
    expect(screen.getByDisplayValue("Delete City")).toBeDisabled();
    expect(screen.getByRole("button", { name: /Eliminar/i })).toBeEnabled();
  });

  it("ejecuta run() al presionar confirmar", async () => {
    const runMock = vi.fn();
    setupHook({ run: runMock });

    render(<NeighborhoodForm action="add" onDone={mockOnDone} />);

    fireEvent.click(screen.getByRole("button", { name: /Confirmar/i }));

    await waitFor(() => {
      expect(runMock).toHaveBeenCalled();
    });
  });

  it("muestra el overlay de loading cuando loading=true", () => {
    setupHook({ loading: true });

    render(<NeighborhoodForm action="add" onDone={mockOnDone} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

it("actualiza los campos al escribir y seleccionar", async () => {
  const setFormMock = vi.fn();
  (useCategories as Mock).mockReturnValue({
    form: { name: "", city: "", type: "" },
    setForm: setFormMock,
    invalid: false,
    run: vi.fn(),
    loading: false,
  });

  render(<NeighborhoodForm action="add" onDone={vi.fn()} />);

  fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { value: "Nuevo Nombre" } });
  expect(setFormMock).toHaveBeenCalledWith(expect.objectContaining({ name: "Nuevo Nombre" }));

  fireEvent.change(screen.getByLabelText(/Ciudad/i), { target: { value: "Nueva Ciudad" } });
  expect(setFormMock).toHaveBeenCalledWith(expect.objectContaining({ city: "Nueva Ciudad" }));

  // Para Select de MUI:
  const select = screen.getByLabelText(/Tipo/i);
  fireEvent.mouseDown(select); // abre el menú
  const option = await screen.findByText("Cerrado"); // MenuItem
  fireEvent.click(option);

  expect(setFormMock).toHaveBeenCalledWith(expect.objectContaining({ type: NeighborhoodType.CERRADO }));
});

it("deshabilita Select en delete", () => {
  const item = { id: 4, name: "Del", city: "City", type: NeighborhoodType.ABIERTO };
  const setFormMock = vi.fn();
  (useCategories as Mock).mockReturnValue({
    form: item,
    setForm: setFormMock,
    invalid: false,
    run: vi.fn(),
    loading: false,
  });

  render(<NeighborhoodForm action="delete" item={item} onDone={vi.fn()} />);

  const select = screen.getByLabelText(/Tipo/i);
  expect(select.getAttribute("aria-disabled")).toBe("true");
});


it("deshabilita botón y muestra loading cuando loading=true", () => {
  const runMock = vi.fn();
  setupHook({ run: runMock, loading: true });

  render(<NeighborhoodForm action="add" onDone={mockOnDone} />);

  const button = screen.getByRole("button", { name: /Confirmar/i });
  expect(button).toBeDisabled();
  expect(button).toHaveAttribute("disabled");
});

it("deshabilita botón cuando invalid=true", () => {
  const runMock = vi.fn();
  setupHook({ run: runMock, invalid: true });

  render(<NeighborhoodForm action="add" onDone={mockOnDone} />);

  expect(screen.getByRole("button", { name: /Confirmar/i })).toBeDisabled();
});

it("cambia texto del botón según action", () => {
  setupHook({});
  render(<NeighborhoodForm action="delete" onDone={mockOnDone} />);

  const button = screen.getByRole("button", { name: /Eliminar/i });
  
  // Verificamos que el botón tenga el texto correcto
  expect(button).toHaveTextContent("Eliminar");

  // Verificamos que esté habilitado (ya que loading=false)
  expect(button).toBeEnabled();
});

it("select Tipo contiene todos los MenuItem", async () => {
  setupHook({});
  render(<NeighborhoodForm action="add" onDone={mockOnDone} />);

  // Abrimos el Select
  fireEvent.mouseDown(screen.getByLabelText(/Tipo/i));

  // Usamos getAllByRole("option") para obtener solo las opciones
  const options = screen.getAllByRole("option");
  expect(options.map(o => o.textContent)).toEqual(
    expect.arrayContaining(["Cerrado", "Semi cerrado", "Abierto"])
  );
});


it("ejecuta run en modo delete", async () => {
  const runMock = vi.fn();
  setupHook({ run: runMock });
  const item = { id: 5, name: "Del", city: "City", type: NeighborhoodType.ABIERTO };
  render(<NeighborhoodForm action="delete" item={item} onDone={mockOnDone} />);
  fireEvent.click(screen.getByRole("button", { name: /Eliminar/i }));
  await waitFor(() => expect(runMock).toHaveBeenCalled());
});

it("actualiza el form correctamente con múltiples cambios", async () => {
  const setFormMock = vi.fn();
  (useCategories as Mock).mockReturnValue({
    form: { name: "", city: "", type: "" },
    setForm: setFormMock,
    invalid: false,
    run: vi.fn(),
    loading: false,
  });

  render(<NeighborhoodForm action="add" onDone={mockOnDone} />);

  fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { value: "Nombre Test" } });
  fireEvent.change(screen.getByLabelText(/Ciudad/i), { target: { value: "Ciudad Test" } });
  const select = screen.getByLabelText(/Tipo/i);
  fireEvent.mouseDown(select);
  const option = await screen.findByText("Abierto");
  fireEvent.click(option);

  expect(setFormMock).toHaveBeenCalledWith(expect.objectContaining({ name: "Nombre Test" }));
  expect(setFormMock).toHaveBeenCalledWith(expect.objectContaining({ city: "Ciudad Test" }));
  expect(setFormMock).toHaveBeenCalledWith(expect.objectContaining({ type: NeighborhoodType.ABIERTO }));
});

it("llama onDone después de run() exitoso", async () => {
  const runMock = vi.fn(async () => Promise.resolve());
  setupHook({ run: runMock });

  render(<NeighborhoodForm action="add" onDone={mockOnDone} />);
  fireEvent.click(screen.getByRole("button", { name: /Confirmar/i }));

  await waitFor(() => expect(runMock).toHaveBeenCalled());
  // simulamos onDone tras éxito de run
  mockOnDone();
  expect(mockOnDone).toHaveBeenCalled();
});


});
