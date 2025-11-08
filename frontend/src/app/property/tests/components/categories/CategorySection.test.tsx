/* CategorySection.test.tsx */
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";

vi.mock("@mui/x-data-grid", () => ({}));
vi.mock("@mui/x-data-grid/styles", () => ({}));
vi.mock("@mui/x-data-grid/esm/index.css", () => ({}));

type GridRowId = number | string;

vi.mock("../../../components/categories/OwnerPropertiesModal", () => ({
  OwnerPropertiesModal: (props: any) =>
    props.open ? <div data-testid="owner-modal">{JSON.stringify(props.owner)}</div> : null,
}));

vi.mock("../../../utils/translate", () => ({
  translate: (c: string) => `TR_${c}`,
}));

let lastGridProps: any = null;
vi.mock("../../../../shared/components/GridSection", () => ({
  GridSection: (props: any) => {
    lastGridProps = props;

    const actionsCol = props.columns.find((c: any) => c.field === "actions");
    const firstRow = props.data?.[0];
    const actionsNode = actionsCol?.renderCell?.({ row: firstRow });

    return (
      <div data-testid="grid-section">
        <div data-testid="entity-name">{props.entityName}</div>
        <div data-testid="selected-ids">{JSON.stringify(props.selectedIds)}</div>
        <div data-testid="multi-select">{String(props.multiSelect)}</div>
        <div data-testid="selectable">{String(props.selectable)}</div>
        <div data-testid="columns-count">{props.columns.length}</div>
        <div data-testid="actions-cell">{actionsNode}</div>

        <button onClick={() => props.onCreate?.()} data-testid="btn-create">
          create
        </button>
        <button onClick={() => props.fetchAll?.()} data-testid="btn-fetch-all">
          fetchAll
        </button>
        <button onClick={() => props.fetchByText?.("")} data-testid="btn-search-blank">
          search-blank
        </button>
        <button onClick={() => props.fetchByText?.("ci")} data-testid="btn-search-term">
          search-term
        </button>
      </div>
    );
  },
}));

vi.mock("../../../components/categories/CategoryModal", () => ({
  ModalItem: ({ info }: any) => (info ? <div data-testid="modal-title">{info.title}</div> : null),
}));

vi.mock("../../../components/forms/AmenityForm", () => ({ AmenityForm: () => <div /> }));
vi.mock("../../../components/forms/OwnerForm", () => ({ OwnerForm: () => <div /> }));
vi.mock("../../../components/forms/TypeForm", () => ({ TypeForm: () => <div /> }));
vi.mock("../../../components/forms/NeighborhoodForm", () => ({ NeighborhoodForm: () => <div /> }));

const refreshMock = vi.fn();
const onSearchMock = vi.fn();
const internalToggleMock = vi.fn();
const internalIsSelectedMock = vi.fn();
let hookData: any[] = [];
let hookLoading = false;

vi.mock("../../../hooks/useCategorySection", () => ({
  useCategorySection: (_category: string) => ({
    data: hookData,
    loading: hookLoading,
    refresh: refreshMock,
    onSearch: onSearchMock,
    toggleSelect: internalToggleMock,
    isSelected: internalIsSelectedMock,
  }),
}));

let globalSelected = {
  amenities: [] as number[],
  type: null as number | null,
  neighborhood: null as number | null,
  owner: null as number | null,
};

vi.mock("../../../context/PropertiesContext", () => ({
  usePropertiesContext: () => ({ selected: globalSelected }),
}));

import { CategorySection } from "../../../components/categories/CategorySection";

const clickActionsButton = (title: string) => {
  const container = screen.getByTestId("actions-cell");
  const btn = container.querySelector(`button[title="${title}"]`) as HTMLButtonElement;
  expect(btn).toBeTruthy();
  fireEvent.click(btn);
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  lastGridProps = null;
  hookData = [];
  hookLoading = false;
  globalSelected = { amenities: [], type: null, neighborhood: null, owner: null };
});

describe("CategorySection", () => {
  it("muestra spinner cuando loading=true", () => {
    hookLoading = true;
    render(<CategorySection category="amenity" />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("amenity: multi-select — hace diff y llama internalToggle en agregados y quitados", async () => {
    hookData = [
      { id: 1, name: "Pileta" },
      { id: 2, name: "Garage" },
      { id: 3, name: "Parrilla" },
    ];
    globalSelected.amenities = [1, 2];
    render(<CategorySection category="amenity" selectable />);

    expect(screen.getByTestId("selected-ids")).toHaveTextContent("[1,2]");
    expect(screen.getByTestId("multi-select")).toHaveTextContent("true");

    internalIsSelectedMock.mockReturnValueOnce(true);
    expect(lastGridProps.isSelected?.(3 as GridRowId)).toBe(true);
    expect(lastGridProps.isSelected?.("xxx" as GridRowId)).toBe(false);

    lastGridProps.toggleSelect?.([2, 3]);
    expect(internalToggleMock).toHaveBeenCalledTimes(2);
    expect(internalToggleMock).toHaveBeenNthCalledWith(1, 3);
    expect(internalToggleMock).toHaveBeenNthCalledWith(2, 1);
  });

  it("owner: single-select — deselección total y selección de nuevo id", () => {
    hookData = [{ id: 10, firstName: "Ana", lastName: "Doe", email: "a@a.com", phone: "1" }];
    globalSelected.owner = 10;
    render(<CategorySection category="owner" selectable />);

    expect(screen.getByTestId("selected-ids")).toHaveTextContent("[10]");

    // deselección total (null) -> toggle del previo (10)
    lastGridProps.toggleSelect?.(null);
    expect(internalToggleMock).toHaveBeenCalledWith(10);

    // selección del mismo id no hace nada
    internalToggleMock.mockClear();
    lastGridProps.toggleSelect?.(10);
    expect(internalToggleMock).not.toHaveBeenCalled();

    // selección de id distinto -> toggle del nuevo
    lastGridProps.toggleSelect?.("11");
    expect(internalToggleMock).toHaveBeenCalledWith(11);

    // id no numérico -> se interpreta como null => deselección del previo (10)
    internalToggleMock.mockClear();
    lastGridProps.toggleSelect?.("nan");
    expect(internalToggleMock).toHaveBeenCalledWith(10);
  });

  it('type: columnas booleanas renderizan "Sí", "No" y "-" según corresponda', () => {
    hookData = [
      {
        id: 1,
        name: "Casa",
        hasRooms: true,
        hasBedrooms: false,
        hasBathrooms: "n/a",
        hasCoveredArea: undefined,
      },
    ];
    globalSelected.type = 1;
    render(<CategorySection category="type" />);

    const cols = lastGridProps.columns as any[];
    const getCol = (f: string) => cols.find((c) => c.field === f);
    const rc = (f: string) => getCol(f).renderCell?.({ row: hookData[0] });

    const { container: c1 } = render(<div>{rc("hasRooms")}</div>);
    expect(c1).toHaveTextContent("Sí");

    const { container: c2 } = render(<div>{rc("hasBedrooms")}</div>);
    expect(c2).toHaveTextContent("No");

    const { container: c3 } = render(<div>{rc("hasBathrooms")}</div>);
    expect(c3).toHaveTextContent("-");

    const { container: c4 } = render(<div>{rc("hasCoveredArea")}</div>);
    expect(c4).toHaveTextContent("-");
  });

  it("neighborhood: fetchAll llama refresh y onSearch con data; fetchByText filtra por claves", async () => {
    hookData = [
      { id: 1, name: "Centro", city: "Córdoba", type: "Urbano" },
      { id: 2, name: "Valle", city: "Carlos Paz", type: "Turístico" },
    ];
    render(<CategorySection category="neighborhood" />);

    await lastGridProps.fetchAll?.();
    expect(refreshMock).toHaveBeenCalled();
    expect(onSearchMock).toHaveBeenCalledWith(hookData);

    onSearchMock.mockClear();
    fireEvent.click(screen.getByTestId("btn-search-blank"));
    expect(onSearchMock).toHaveBeenCalledWith(hookData);
  });

  it("neighborhood: fetchByText filtra por name/city/type (case-insensitive)", () => {
    hookData = [
      { id: 1, name: "Centro", city: "Córdoba", type: "Urbano" },
      { id: 2, name: "Valle", city: "Carlos Paz", type: "Turístico" },
    ];
    render(<CategorySection category="neighborhood" />);

    const filteredByName = lastGridProps.fetchByText?.("val");
    return Promise.resolve(filteredByName).then((res: any[]) => {
      expect(res.map((x) => x.id)).toEqual([2]);
      expect(onSearchMock).toHaveBeenLastCalledWith([{ id: 2, name: "Valle", city: "Carlos Paz", type: "Turístico" }]);
    });
  });

  it("owner: fetchByText considera firstName/lastName/email/phone", async () => {
    hookData = [
      { id: 1, firstName: "Ana", lastName: "Lopez", email: "ana@test.com", phone: "123" },
      { id: 2, firstName: "Juan", lastName: "Perez", email: "jp@x.com", phone: "456" },
    ];
    render(<CategorySection category="owner" />);
    const result = await lastGridProps.fetchByText?.("perez");
    expect(result.map((x: any) => x.id)).toEqual([2]);

    const result2 = await lastGridProps.fetchByText?.("ANA");
    expect(result2.map((x: any) => x.id)).toEqual([1]);

    const result3 = await lastGridProps.fetchByText?.("456");
    expect(result3.map((x: any) => x.id)).toEqual([2]);
  });

  it("acciones: abrir modal Add/Edit/Delete y muestra títulos traducidos", () => {
    hookData = [{ id: 1, name: "Parrilla" }];
    render(<CategorySection category="amenity" />);

    fireEvent.click(screen.getByTestId("btn-create"));
    expect(screen.getByTestId("modal-title")).toHaveTextContent("Crear TR_amenity");

    clickActionsButton("Editar");
    expect(screen.getByTestId("modal-title")).toHaveTextContent("Editar TR_amenity");

    clickActionsButton("Eliminar");
    expect(screen.getByTestId("modal-title")).toHaveTextContent("Eliminar TR_amenity");
  });

  it("pasa correctamente flags y metadatos al GridSection (entityName/multi/selectable/columns)", () => {
    hookData = [{ id: 1, name: "X" }];
    render(<CategorySection category="amenity" selectable={false} />);
    expect(screen.getByTestId("entity-name")).toHaveTextContent("TR_amenity");
    expect(screen.getByTestId("multi-select")).toHaveTextContent("true");
    expect(screen.getByTestId("selectable")).toHaveTextContent("false");
    expect(Number(screen.getByTestId("columns-count").textContent!)).toBeGreaterThan(0);
  });
});
