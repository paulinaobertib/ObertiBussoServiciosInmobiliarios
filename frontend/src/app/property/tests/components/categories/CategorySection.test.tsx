/// <reference types="vitest" />
import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";

let lastGridProps: any = null;
vi.mock("../../../../shared/components/GridSection", () => ({
  GridSection: (props: any) => {
    lastGridProps = props;
    return (
      <div data-testid="grid">
        <button onClick={() => props.onCreate?.()} data-testid="btn-create">
          create
        </button>
        <button
          onClick={() => props.onEdit?.(props.data?.[0])}
          data-testid="btn-edit"
        >
          edit
        </button>
        <button
          onClick={() => props.onDelete?.(props.data?.[0])}
          data-testid="btn-delete"
        >
          delete
        </button>
      </div>
    );
  },
}));

vi.mock("../../../components/categories/CategoryModal", () => ({
  ModalItem: ({ info, close }: any) =>
    info ? (
      <div data-testid="modal">
        <span data-testid="modal-title">{info.title}</span>
        <button data-testid="modal-close" onClick={close}>
          close
        </button>
      </div>
    ) : null,
}));

vi.mock("../../utils/translate", () => ({
  translate: (cat: string) =>
    (
      {
        owner: "Propietario",
        amenity: "Amenidad",
        type: "Tipo",
        neighborhood: "Barrio",
      } as any
    )[cat] || cat,
}));

vi.mock("../../../components/forms/AmenityForm", () => ({ AmenityForm: () => <div /> }));
vi.mock("../../../components/forms/OwnerForm", () => ({ OwnerForm: () => <div /> }));
vi.mock("../../../components/forms/TypeForm", () => ({ TypeForm: () => <div /> }));
vi.mock("../../../components/forms/NeighborhoodForm", () => ({ NeighborhoodForm: () => <div /> }));

const refreshMock = vi.fn();
const onSearchMock = vi.fn();
const internalToggleMock = vi.fn();
const internalIsSelectedMock = vi.fn();

vi.mock("../../../hooks/useCategorySection", () => ({
  useCategorySection: vi.fn((category: string) => {
    const base = {
      loading: false,
      refresh: refreshMock,
      onSearch: onSearchMock,
      toggleSelect: internalToggleMock,
      isSelected: internalIsSelectedMock,
    };

    if (category === "owner") {
      return {
        ...base,
        data: [
          { id: 1, fullName: "Juan Perez", email: "jp@test.com", phone: "123" },
          { id: 2, fullName: "Ana Gomez", email: "ag@test.com", phone: "555" },
        ],
      };
    }
    if (category === "amenity") {
      return {
        ...base,
        data: [
          { id: 10, name: "Pileta" },
          { id: 20, name: "Parrilla" },
        ],
      };
    }
    if (category === "type") {
      return {
        ...base,
        data: [
          {
            id: 100,
            name: "Casa",
            hasRooms: true,
            hasBedrooms: false,
            hasBathrooms: true,
            hasCoveredArea: null,
          } as any,
        ],
      };
    }
    return {
      ...base,
      data: [
        { id: 300, name: "Centro", city: "Córdoba", type: "Urbano" },
        { id: 400, name: "Palermo", city: "Buenos Aires", type: "Urbano" },
      ],
    };
  }),
}));

import { CategorySection } from "../../../components/categories/CategorySection";

const resetGridProps = () => { lastGridProps = null; };

describe("<CategorySection />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetGridProps();
  });

  it("pasa columnas dinámicas y renderiza Sí/No/- para booleanos en category='type'", () => {
    render(<CategorySection category="type" />);
    expect(lastGridProps).toBeTruthy();
    const cols = lastGridProps.columns as Array<any>;
    const byField = Object.fromEntries(cols.map((c: any) => [c.field, c]));
    const row = lastGridProps.data[0];

    expect(byField["hasRooms"].renderCell({ row })).toBe("Sí");
    expect(byField["hasBedrooms"].renderCell({ row })).toBe("No");
    expect(byField["hasCoveredArea"].renderCell({ row })).toBe("-");
  });

  it("adaptador gridToggleSelect transforma string/array a number y llama internalToggle", () => {
    render(<CategorySection category="owner" />);
    const toggle = lastGridProps.toggleSelect as (sel: any) => void;

    toggle("7");
    toggle(["3", "5"]);
    toggle(null);

    expect(internalToggleMock).toHaveBeenCalledWith(7);
    expect(internalToggleMock).toHaveBeenCalledWith(5);
    expect(internalToggleMock).toHaveBeenCalledTimes(2);
  });

  it("gridIsSelected convierte id:string a number y delega en internalIsSelected", () => {
    internalIsSelectedMock.mockReturnValueOnce(true);
    render(<CategorySection category="owner" />);
    const isSel = lastGridProps.isSelected as (id: string) => boolean;

    const r = isSel("42");
    expect(internalIsSelectedMock).toHaveBeenCalledWith(42);
    expect(r).toBe(true);
  });

  it("fetchAll llama refresh, onSearch con data y devuelve data", async () => {
    render(<CategorySection category="owner" />);
    const result = await lastGridProps.fetchAll();
    expect(refreshMock).toHaveBeenCalled();
    expect(onSearchMock).toHaveBeenCalledWith(lastGridProps.data);
    expect(result).toEqual(lastGridProps.data);
  });

  it("fetchByText filtra por amenity.name", async () => {
    render(<CategorySection category="amenity" />);
    const filtered = await lastGridProps.fetchByText("pile");
    expect(filtered).toEqual([{ id: 10, name: "Pileta" }]);
    expect(onSearchMock).toHaveBeenCalledWith([{ id: 10, name: "Pileta" }]);
  });

  it("fetchByText filtra por neighborhood (name/city/type)", async () => {
    render(<CategorySection category="neighborhood" />);
    const filtered = await lastGridProps.fetchByText("palermo");
    expect(filtered).toEqual([
      { id: 400, name: "Palermo", city: "Buenos Aires", type: "Urbano" },
    ]);
    expect(onSearchMock).toHaveBeenCalledWith([
      { id: 400, name: "Palermo", city: "Buenos Aires", type: "Urbano" },
    ]);
  });

  it("acciones: onCreate/onEdit/onDelete abren modal con el título correcto", () => {
    render(<CategorySection category="owner" />);

    fireEvent.click(screen.getByTestId("btn-create"));
    expect(screen.getByTestId("modal-title")).toHaveTextContent("Crear Propietario");
    fireEvent.click(screen.getByTestId("modal-close"));
    expect(screen.queryByTestId("modal")).toBeNull();

    fireEvent.click(screen.getByTestId("btn-edit"));
    expect(screen.getByTestId("modal-title")).toHaveTextContent("Editar Propietario");
    fireEvent.click(screen.getByTestId("modal-close"));

    fireEvent.click(screen.getByTestId("btn-delete"));
    expect(screen.getByTestId("modal-title")).toHaveTextContent("Eliminar Propietario");
  });

  it("multiSelect es true solo para amenity", () => {
    render(<CategorySection category="amenity" />);
    expect(lastGridProps.multiSelect).toBe(true);

    render(<CategorySection category="owner" />);
    expect(lastGridProps.multiSelect).toBe(false);
  });

  it("pasa showActions=true y entityName traducido", () => {
    render(<CategorySection category="owner" />);
    expect(lastGridProps.showActions).toBe(true);
    expect(lastGridProps.entityName).toBe("Propietario");
  });

  it("fetchByText devuelve todo si texto vacío", async () => {
    render(<CategorySection category="amenity" />);
    const result = await lastGridProps.fetchByText("");
    expect(result).toEqual(lastGridProps.data);
    expect(onSearchMock).toHaveBeenCalledWith(lastGridProps.data);
  });

  it("fetchByText devuelve vacío si no hay coincidencias", async () => {
    render(<CategorySection category="amenity" />);
    const result = await lastGridProps.fetchByText("xyz");
    expect(result).toEqual([]);
    expect(onSearchMock).toHaveBeenCalledWith([]);
  });

  it("Modal se cierra correctamente", () => {
    render(<CategorySection category="owner" />);
    fireEvent.click(screen.getByTestId("btn-create"));
    expect(screen.getByTestId("modal")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("modal-close"));
    expect(screen.queryByTestId("modal")).toBeNull();
  });

  it("pasa selectable correctamente a GridSection", () => {
    render(<CategorySection category="owner" selectable={false} />);
    expect(lastGridProps.selectable).toBe(false);

    render(<CategorySection category="owner" selectable />);
    expect(lastGridProps.selectable).toBe(true);
  });

});
