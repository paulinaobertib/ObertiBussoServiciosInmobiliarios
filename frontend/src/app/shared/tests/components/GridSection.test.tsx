/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { GridSection } from "../../components/GridSection";

/* ─────────────────────────── Mocks ─────────────────────────── */

// Mock muy simple del Modal (queremos inspeccionar props)
vi.mock("../../components/Modal", () => ({
  Modal: ({ open, title, children }: any) => (
    <div data-testid="modal" data-open={String(open)} data-title={title}>
      {children}
    </div>
  ),
}));

// Mock del SearchBar que nos deja disparar fetchAll/fetchByText y onSearch
vi.mock("../../components/SearchBar", () => ({
  SearchBar: ({ onSearch, fetchAll, fetchByText, placeholder }: any) => (
    <div data-testid="searchbar" data-placeholder={placeholder}>
      <button
        data-testid="search-all"
        onClick={async () => {
          const r = await fetchAll();
          onSearch(r);
        }}
      >
        all
      </button>
      <button
        data-testid="search-text"
        onClick={async () => {
          const r = await fetchByText("abc");
          onSearch(r);
        }}
      >
        text
      </button>
    </div>
  ),
}));

// Mock del DataGrid para poder capturar y disparar handlers
// ⚠️ Usamos _props para evitar warning TS6133 (variable no usada)
const DataGridMock = vi.fn((_props: any) => <div data-testid="grid" />);
vi.mock("@mui/x-data-grid", () => ({
  DataGrid: (p: any) => DataGridMock(p),
}));

/* ─────────────────────────── Utils ─────────────────────────── */

const getLastGridProps = () => {
  const calls = DataGridMock.mock.calls;
  expect(calls.length).toBeGreaterThan(0);
  // cada render llama al mock con 1er arg = props
  return calls[calls.length - 1][0];
};

beforeEach(() => {
  vi.clearAllMocks();
});

/* ─────────────────────────── Tests ─────────────────────────── */

describe("GridSection", () => {
  const entityName = "Usuario";
  const columns = [{ field: "id", headerName: "ID" }];
  const data = [
    { id: 1, name: "A" },
    { ID: 2, name: "B" },
    { Id: 3, name: "C" },
    { _id: "x-4", name: "D" },
  ];

  it("renderiza SearchBar, botón crear y Modal con título", () => {
    const onSearch = vi.fn();
    const onCreate = vi.fn();
    const fetchAll = vi.fn(async () => []);
    const fetchByText = vi.fn(async () => []);

    render(
      <GridSection
        data={[]}
        loading={false}
        columns={columns as any}
        onSearch={onSearch}
        onCreate={onCreate}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        entityName={entityName}
        fetchAll={fetchAll}
        fetchByText={fetchByText}
      />
    );

    // SearchBar visible con placeholder correcto
    const sb = screen.getByTestId("searchbar");
    expect(sb).toHaveAttribute("data-placeholder", `Buscar ${entityName}...`);

    // Botón crear con el label de la entidad
    expect(screen.getByRole("button", { name: entityName })).toBeInTheDocument();

    // Modal presente, cerrado y con título correcto
    const modal = screen.getByTestId("modal");
    expect(modal).toHaveAttribute("data-open", "false");
    expect(modal).toHaveAttribute("data-title", `${entityName} Details`);
  });

  it("dispara onCreate al hacer click en el botón", () => {
    const onCreate = vi.fn();

    render(
      <GridSection
        data={[]}
        loading={false}
        columns={columns as any}
        onSearch={vi.fn()}
        onCreate={onCreate}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        entityName={entityName}
        fetchAll={vi.fn(async () => [])}
        fetchByText={vi.fn(async () => [])}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: entityName }));
    expect(onCreate).toHaveBeenCalledTimes(1);
  });

  it("SearchBar: search-all llama fetchAll y onSearch; search-text llama fetchByText y onSearch", async () => {
    const onSearch = vi.fn();
    const fetchAll = vi.fn(async () => [{ ok: 1 }]);
    const fetchByText = vi.fn(async () => [{ q: "abc" }]);

    render(
      <GridSection
        data={[]}
        loading={false}
        columns={columns as any}
        onSearch={onSearch}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        entityName={entityName}
        fetchAll={fetchAll}
        fetchByText={fetchByText}
      />
    );

    // all
    await fireEvent.click(screen.getByTestId("search-all"));
    expect(fetchAll).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith([{ ok: 1 }]);

    // text
    await fireEvent.click(screen.getByTestId("search-text"));
    expect(fetchByText).toHaveBeenCalledWith("abc");
    expect(onSearch).toHaveBeenCalledWith([{ q: "abc" }]);
  });

  it("DataGrid: getRowId soporta id/ID/Id/_id y pagina con pageSize fijo=10", () => {
    render(
      <GridSection
        data={data}
        loading={false}
        columns={columns as any}
        onSearch={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        entityName={entityName}
        fetchAll={vi.fn(async () => [])}
        fetchByText={vi.fn(async () => [])}
      />
    );

    const props = getLastGridProps();

    // getRowId mapping
    expect(props.getRowId({ id: 7 })).toBe(7);
    expect(props.getRowId({ ID: 8 })).toBe(8);
    expect(props.getRowId({ Id: 9 })).toBe(9);
    expect(props.getRowId({ _id: "xyz" })).toBe("xyz");

    // state inicial de paginación
    expect(props.paginationModel).toEqual({ page: 0, pageSize: 10 });
    expect(props.pageSizeOptions).toEqual([10]);
    expect(props.localeText?.noRowsLabel).toBe("No hay resultados.");

    // Cambiamos paginación (el hook debe forzar pageSize=10)
    act(() => {
      props.onPaginationModelChange?.({ page: 2, pageSize: 999 });
    });

    const props2 = getLastGridProps();
    expect(props2.paginationModel).toEqual({ page: 2, pageSize: 10 });
  });

  it("Selección: single-select envía el último id; multi-select envía array", () => {
    const toggleSelect = vi.fn();

    const { rerender } = render(
      <GridSection
        data={data}
        loading={false}
        columns={columns as any}
        onSearch={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        entityName={entityName}
        fetchAll={vi.fn(async () => [])}
        fetchByText={vi.fn(async () => [])}
        toggleSelect={toggleSelect}
        // multiSelect = false (default)
      />
    );

    // Single select: envía el último
    let props = getLastGridProps();
    props.onRowSelectionModelChange?.(
      { type: "include", ids: new Set([1, 2]) },
      {} as any
    );
    expect(toggleSelect).toHaveBeenLastCalledWith(2);

    // Si limpiamos selección -> null
    props = getLastGridProps();
    props.onRowSelectionModelChange?.(
      { type: "include", ids: new Set([]) },
      {} as any
    );
    expect(toggleSelect).toHaveBeenLastCalledWith(null);

    // Multi select: envía array
    rerender(
      <GridSection
        data={data}
        loading={false}
        columns={columns as any}
        onSearch={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        entityName={entityName}
        fetchAll={vi.fn(async () => [])}
        fetchByText={vi.fn(async () => [])}
        toggleSelect={toggleSelect}
        multiSelect
      />
    );
    props = getLastGridProps();
    props.onRowSelectionModelChange?.(
      { type: "include", ids: new Set([3, 4]) },
      {} as any
    );
    expect(toggleSelect).toHaveBeenLastCalledWith([3, 4]);
  });

  it("selectedIds preselecciona filas en el grid; selectable=false deshabilita selección", () => {
    const { rerender } = render(
      <GridSection
        data={data}
        loading={false}
        columns={columns as any}
        onSearch={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        entityName={entityName}
        fetchAll={vi.fn(async () => [])}
        fetchByText={vi.fn(async () => [])}
        selectedIds={[10, 20]}
      />
    );

    // Tras el efecto, el DataGrid recibe rowSelectionModel con esos ids
    let props = getLastGridProps();
    const ids1: Set<any> = props.rowSelectionModel?.ids;
    expect(ids1 instanceof Set).toBe(true);
    expect(Array.from(ids1)).toEqual([10, 20]);

    // selectable=false → sin checkboxSelection y selección vacía
    rerender(
      <GridSection
        data={data}
        loading={false}
        columns={columns as any}
        onSearch={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        entityName={entityName}
        fetchAll={vi.fn(async () => [])}
        fetchByText={vi.fn(async () => [])}
        selectable={false}
      />
    );
    props = getLastGridProps();
    expect(props.checkboxSelection).toBe(false);
    const ids2: Set<any> = props.rowSelectionModel?.ids;
    expect(ids2.size).toBe(0);
  });
});
