/// <reference types="vitest" />
import React from "react";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { render as rtlRender } from "@testing-library/react";

vi.mock("@mui/x-data-grid/esm/index.css", () => ({}));

const h = vi.hoisted(() => {
  return {
    navigateMock: vi.fn(),

    onSearchMock: vi.fn(),
    internalToggleMock: vi.fn(),
    internalIsSelectedMock: vi.fn(),

    // servicios
    getAllMock: vi.fn(async () => [{ id: 10, title: "A", operation: "VENTA", status: "DISPONIBLE" }]),
    getAvailableMock: vi.fn(async () => [{ id: 99, title: "Avail", operation: "ALQUILER", status: "DISPONIBLE" }]),
    getByTextMock: vi.fn(async (_: string) => [{ id: 20, title: "B", operation: "ALQUILER", status: "DISPONIBLE" }]),
    delPropMock: vi.fn(),

    // row actions
    actionClick1: vi.fn(),
    actionClick2: vi.fn(),
    getRowActionsMock: vi.fn(() => [
      { label: "Editar", icon: <span>E</span>, onClick: h.actionClick1 },
      { label: "Eliminar", icon: <span>D</span>, onClick: h.actionClick2 },
    ]),

    askMock: vi.fn(),
    showAlertMock: vi.fn(),
    doubleConfirmMock: vi.fn(),
    successMock: vi.fn(),

    // para capturar props que le llegan al Grid mockeado
    lastGridProps: null as any,
  };
});

// ========= Mocks de dependencias =========
vi.mock("../../../../shared/components/GridSection", () => ({
  GridSection: (props: any) => {
    h.lastGridProps = props;
    return (
      <div data-testid="grid">
        <button data-testid="create" onClick={() => props.onCreate?.()}>
          create
        </button>
        <button data-testid="edit" onClick={() => props.onEdit?.(props.data?.[0])}>
          edit
        </button>
        <button data-testid="delete" onClick={() => props.onDelete?.(props.data?.[0])}>
          delete
        </button>
        <button data-testid="toggle-1" onClick={() => props.toggleSelect?.("7")}>
          toggle-1
        </button>
        <button data-testid="toggle-2" onClick={() => props.toggleSelect?.(["2", "9"])}>
          toggle-2
        </button>
        <button data-testid="isSel" onClick={() => props.isSelected?.("42")}>
          isSel
        </button>
        {/* Render de la celda “price” para validar renderCell */}
        <div data-testid="cell-price">
          {props.columns?.find((c: any) => c.field === "price")?.renderCell?.({ row: props.data?.[0] ?? {} })}
        </div>
      </div>
    );
  },
}));

vi.mock("../../../../shared/components/ConfirmDialog", () => ({
  useConfirmDialog: vi.fn(() => ({
    ask: h.askMock,
    DialogUI: <div data-testid="dialog-ui" />,
  })),
}));

vi.mock("../../../../shared/context/AlertContext", () => ({
  useGlobalAlert: vi.fn(() => ({
    showAlert: h.showAlertMock,
    doubleConfirm: h.doubleConfirmMock,
    success: h.successMock,
  })),
}));

const authContextMock = vi.fn(() => ({ isAdmin: false, info: null }));
vi.mock("../../../user/context/AuthContext", () => ({
  useAuthContext: authContextMock,
}));

vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(() => h.navigateMock),
}));

vi.mock("../../../hooks/usePropertySection", () => ({
  usePropertyPanel: vi.fn(() => ({
    data: [
      {
        id: 1,
        title: "P1",
        operation: "VENTA",
        currency: "USD",
        price: 100,
        status: "DISPONIBLE",
      },
      {
        id: 2,
        title: "P2",
        operation: "ALQUILER",
        currency: "ARS",
        price: null,
        status: "VENDIDO",
      },
    ],
    loading: false,
    onSearch: h.onSearchMock,
    toggleSelect: h.internalToggleMock,
    isSelected: h.internalIsSelectedMock,
  })),
}));

vi.mock("../../../services/property.service", () => ({
  getAllProperties: h.getAllMock,
  getAvailableProperties: h.getAvailableMock,
  getPropertiesByText: h.getByTextMock,
  deleteProperty: h.delPropMock,
}));

vi.mock("../../../components/properties/ActionsRowItems", () => ({
  getRowActions: h.getRowActionsMock,
}));

vi.mock("../../../context/PropertiesContext", () => ({
  usePropertiesContext: vi.fn(() => ({
    pickItem: vi.fn(),
    selected: {},
  })),
}));

// ---- SUT ----
import { PropertySection } from "../../../components/properties/PropertySection";

const renderSUT = (props: Partial<React.ComponentProps<typeof PropertySection>> = {}) =>
  render(<PropertySection {...props} />);

describe("<PropertySection />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.lastGridProps = null;
    h.doubleConfirmMock.mockReset();
    h.doubleConfirmMock.mockResolvedValue(true);
    h.successMock.mockReset();
    h.getAvailableMock.mockReset();
    h.getByTextMock.mockReset();
    h.getAllMock.mockReset();
    authContextMock.mockReset();
    authContextMock.mockReturnValue({ isAdmin: false, info: null });
  });

  it("muestra spinner cuando loading=true", async () => {
    const { usePropertyPanel } = await import("../../../hooks/usePropertySection");
    (usePropertyPanel as any).mockReturnValueOnce({
      data: [],
      loading: true,
      onSearch: h.onSearchMock,
      toggleSelect: h.internalToggleMock,
      isSelected: h.internalIsSelectedMock,
    });

    renderSUT();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("pasa datos al Grid y filtra disponibles cuando filterAvailable=true", () => {
    renderSUT({ filterAvailable: true });
    expect(h.lastGridProps).toBeTruthy();
    expect(h.lastGridProps.data).toEqual([expect.objectContaining({ id: 1, status: "DISPONIBLE" })]);
  });

  it("columnas incluyen Precio con renderCell correcto", () => {
    renderSUT();
    const cols = h.lastGridProps.columns as any[];
    const priceCol = cols.find((c: any) => c.field === "price");
    expect(priceCol).toBeTruthy();

    // ARS con precio nulo => “—”
    const el1 = priceCol.renderCell({ row: { currency: "ARS", price: null } });
    const { container: c1 } = rtlRender(el1);
    expect(c1.textContent).toContain("ARS —");

    // USD con precio 100 => “USD 100”
    const el2 = priceCol.renderCell({ row: { currency: "USD", price: 100 } });
    const { container: c2 } = rtlRender(el2);
    expect(c2.textContent).toContain("USD 100");
  });

  it("gridToggleSelect adapta string/array a number y llama al toggle interno", () => {
    renderSUT();
    fireEvent.click(screen.getByTestId("toggle-1"));
    fireEvent.click(screen.getByTestId("toggle-2"));

    expect(h.internalToggleMock).toHaveBeenCalledWith(7);
    expect(h.internalToggleMock).toHaveBeenCalledWith(9);
    expect(h.internalToggleMock).toHaveBeenCalledTimes(2);
  });

  it("gridIsSelected convierte id:string a number y delega en el hook", () => {
    h.internalIsSelectedMock.mockReturnValueOnce(true);
    renderSUT();

    fireEvent.click(screen.getByTestId("isSel"));
    expect(h.internalIsSelectedMock).toHaveBeenCalledWith(42);
  });

  it("fetchAll y fetchByText llaman servicios, actualizan búsqueda y retornan los datos", async () => {
    h.getAvailableMock.mockResolvedValue([{ id: 99, title: "Avail", operation: "ALQUILER", status: "DISPONIBLE" }]);
    h.getByTextMock.mockResolvedValue([{ id: 20, title: "B", operation: "ALQUILER", status: "DISPONIBLE" }]);
    renderSUT();
    const list1 = await h.lastGridProps.fetchAll();
    expect(h.getAvailableMock).toHaveBeenCalled();
    expect(h.onSearchMock).toHaveBeenCalledWith(list1);
    expect(list1).toEqual([{ id: 99, title: "Avail", operation: "ALQUILER", status: "DISPONIBLE" }]);

    const list2 = await h.lastGridProps.fetchByText("x");
    expect(h.getByTextMock).toHaveBeenCalledWith("x");
    expect(h.onSearchMock).toHaveBeenCalledWith(list2);
    expect(list2).toEqual([{ id: 20, title: "B", operation: "ALQUILER", status: "DISPONIBLE" }]);
  });

  it("onCreate navega a /properties/new y onEdit a /properties/:id/edit", () => {
    renderSUT();

    fireEvent.click(screen.getByTestId("create"));
    expect(h.navigateMock).toHaveBeenCalledWith("/properties/new");

    fireEvent.click(screen.getByTestId("edit"));
    expect(h.navigateMock).toHaveBeenCalledWith("/properties/1/edit");
  });

  it("GridSection recibe props clave: entityName, showActions=false, multiSelect=false", () => {
    renderSUT({ showActions: false });
    expect(h.lastGridProps.entityName).toBe("Propiedad");
    expect(h.lastGridProps.showActions).toBe(false);
    expect(h.lastGridProps.multiSelect).toBe(false);
  });

  it("filtra filas por operationFilter y availableOnly al buscar", async () => {
    renderSUT({ operationFilter: "ALQUILER" });
    expect(h.lastGridProps.data).toEqual([expect.objectContaining({ operation: "ALQUILER" })]);

    renderSUT({ availableOnly: true });
    h.getByTextMock.mockResolvedValueOnce([
      { id: 1, title: "Prop1", operation: "VENTA", status: "DISPONIBLE" },
      { id: 2, title: "Prop2", operation: "ALQUILER", status: "VENDIDO" },
    ]);
    const filtered = await h.lastGridProps.fetchByText("x");
    expect(filtered).toEqual([{ id: 1, title: "Prop1", operation: "VENTA", status: "DISPONIBLE" }]);
    expect(h.onSearchMock).toHaveBeenCalledWith([{ id: 1, title: "Prop1", operation: "VENTA", status: "DISPONIBLE" }]);
  });

  it("mantiene la fila seleccionada aunque no esté disponible cuando filterAvailable=true", () => {
    renderSUT({ filterAvailable: true, selectedIds: [2] });
    expect(h.lastGridProps.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 2, status: "VENDIDO" })])
    );
  });

  it("fetchAll aplica operationFilter a las propiedades disponibles", async () => {
    h.getAvailableMock.mockResolvedValueOnce([
      { id: 5, title: "Propiedad ALQ", operation: "ALQUILER", status: "DISPONIBLE" },
      { id: 6, title: "Propiedad VENTA", operation: "VENTA", status: "DISPONIBLE" },
    ]);
    renderSUT({ operationFilter: "ALQUILER" });

    const list = await h.lastGridProps.fetchAll();
    expect(h.getAvailableMock).toHaveBeenCalled();
    expect(h.getAllMock).not.toHaveBeenCalled();
    expect(h.onSearchMock).toHaveBeenCalledWith(list);
    expect(list).toEqual([{ id: 5, title: "Propiedad ALQ", operation: "ALQUILER", status: "DISPONIBLE" }]);
  });

  it("no intenta eliminar si el usuario cancela la confirmación", async () => {
    h.doubleConfirmMock.mockResolvedValueOnce(false);
    renderSUT();

    await act(async () => fireEvent.click(screen.getByTestId("delete")));

    expect(h.delPropMock).not.toHaveBeenCalled();
    expect(h.successMock).not.toHaveBeenCalled();
  });

  it("handleDelete confirma, elimina y muestra éxito", async () => {
    h.delPropMock.mockResolvedValueOnce(undefined);
    renderSUT();

    await act(async () => {
      fireEvent.click(screen.getByTestId("delete"));
    });

    await waitFor(() => {
      expect(h.delPropMock).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
    });
    expect(h.successMock).toHaveBeenCalledWith({
      title: "Propiedad eliminada",
      description: expect.stringContaining('"P1"'),
      primaryLabel: "Volver",
    });
  });
});
