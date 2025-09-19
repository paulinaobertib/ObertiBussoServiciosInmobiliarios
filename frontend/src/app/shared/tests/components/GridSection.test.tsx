/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GridSection } from "../../../shared/components/GridSection";

vi.mock("../../../shared/components/Modal", () => {
  const Modal = vi.fn((props: any) =>
    props.open ? (
      <div data-testid="modal">
        <h2>{props.title}</h2>
        {props.children}
      </div>
    ) : null
  );
  return { Modal };
});
import { Modal as ModalMock } from "../../../shared/components/Modal";
const Modal = ModalMock as unknown as Mock;

vi.mock("../../../shared/components/SearchBar", () => {
  const SearchBar = vi.fn((props: any) => (
    <div data-testid="searchbar" data-placeholder={props.placeholder} />
  ));
  return { SearchBar };
});
import { SearchBar as SearchBarMock } from "../../../shared/components/SearchBar";
const SearchBar = SearchBarMock as unknown as Mock;

vi.mock("@mui/x-data-grid", () => {
  const DataGrid = vi.fn(() => <div data-testid="datagrid" />);
  return { DataGrid };
});
import { DataGrid as DataGridMock } from "@mui/x-data-grid";
const DataGrid = DataGridMock as unknown as Mock;

const cols = [{ field: "id", headerName: "ID", width: 100 }];

const getLastDataGridProps = () => {
  const calls = DataGrid.mock.calls;
  expect(calls.length).toBeGreaterThan(0);
  return calls.at(-1)![0];
};

describe("GridSection", () => {
  beforeEach(() => vi.clearAllMocks());

  it("pasa onSearch, fetchAll y fetchByText a SearchBar", () => {
    const onSearch = vi.fn();
    const fetchAll = vi.fn();
    const fetchByText = vi.fn();

    render(
      <GridSection
        data={[]}
        loading={false}
        columns={cols as any}
        onSearch={onSearch}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        entityName="Users"
        fetchAll={fetchAll}
        fetchByText={fetchByText}
      />
    );

    const [props] = (SearchBar as Mock).mock.calls[0];
    expect(props.onSearch).toBe(onSearch);
    expect(props.fetchAll).toBe(fetchAll);
    expect(props.fetchByText).toBe(fetchByText);
  });

  it("llama onCreate al hacer clic en el botón", async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();

    render(
      <GridSection
        data={[]}
        loading={false}
        columns={cols as any}
        onSearch={vi.fn()}
        onCreate={onCreate}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        entityName="Role"
        fetchAll={vi.fn()}
        fetchByText={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: "Role" }));
    expect(onCreate).toHaveBeenCalledTimes(1);
  });

  it("propaga loading a DataGrid", () => {
    render(
      <GridSection
        data={[]}
        loading={true}
        columns={cols as any}
        onSearch={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        entityName="Items"
        fetchAll={vi.fn()}
        fetchByText={vi.fn()}
      />
    );
    const props = getLastDataGridProps();
    expect(props.loading).toBe(true);
  });

  it("muestra EmptyState cuando no hay filas y loading=false", () => {
    render(
      <GridSection
        data={[]}
        loading={false}
        columns={cols as any}
        onSearch={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        entityName="Usuarios"
        fetchAll={vi.fn()}
        fetchByText={vi.fn()}
      />
    );

    expect(screen.getByText(/No hay registros disponibles\./i)).toBeInTheDocument();
    expect(DataGrid).not.toHaveBeenCalled();
  });

  it("muestra EmptyState de error cuando llega error", () => {
    render(
      <GridSection
        data={[]}
        loading={false}
        columns={cols as any}
        onSearch={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        entityName="Usuarios"
        fetchAll={vi.fn()}
        fetchByText={vi.fn()}
        error="boom"
      />
    );

    expect(screen.getByRole('heading', { name: /No pudimos cargar la información/i })).toBeInTheDocument();
    expect(DataGrid).not.toHaveBeenCalled();
  });

  it("selección SINGLE: llama toggleSelect con el último id (string) y actualiza rowSelectionModel", async () => {
    const toggleSelect = vi.fn();

    render(
      <GridSection
        data={[{ id: 1 }, { id: 2 }]}
        loading={false}
        columns={cols as any}
        onSearch={vi.fn()}
        toggleSelect={toggleSelect}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        entityName="X"
        fetchAll={vi.fn()}
        fetchByText={vi.fn()}
      />
    );

    const propsBefore = getLastDataGridProps();
    await act(async () => {
      await propsBefore.onRowSelectionModelChange?.({
        type: "include",
        ids: new Set([1, 2]),
      });
    });

    expect(toggleSelect).toHaveBeenCalledWith("2");

    await waitFor(() => {
      const propsAfter = getLastDataGridProps();
      expect(Array.from(propsAfter.rowSelectionModel.ids)).toEqual([2]);
    });
  });

  it("selección SINGLE: al deseleccionar todo, llama toggleSelect(null) y vacía rowSelectionModel", async () => {
    const toggleSelect = vi.fn();

    render(
      <GridSection
        data={[{ id: 1 }, { id: 2 }]}
        loading={false}
        columns={cols as any}
        onSearch={vi.fn()}
        toggleSelect={toggleSelect}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        entityName="X"
        fetchAll={vi.fn()}
        fetchByText={vi.fn()}
      />
    );

    const propsBefore = getLastDataGridProps();
    await act(async () => {
      await propsBefore.onRowSelectionModelChange?.({
        type: "include",
        ids: new Set(),
      });
    });

    expect(toggleSelect).toHaveBeenCalledWith(null);

    await waitFor(() => {
      const propsAfter = getLastDataGridProps();
      expect(Array.from(propsAfter.rowSelectionModel.ids)).toEqual([]);
    });
  });

  it("selección MULTI: llama toggleSelect con string[] y conserva ids internamente", async () => {
    const toggleSelect = vi.fn();

    render(
      <GridSection
        data={[{ id: "a" }, { id: "b" }, { id: "c" }]}
        loading={false}
        columns={cols as any}
        onSearch={vi.fn()}
        toggleSelect={toggleSelect}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        entityName="Y"
        fetchAll={vi.fn()}
        fetchByText={vi.fn()}
        multiSelect
      />
    );

    const propsBefore = getLastDataGridProps();
    await act(async () => {
      await propsBefore.onRowSelectionModelChange?.({
        type: "include",
        ids: new Set(["a", "c"]),
      });
    });

    expect(toggleSelect).toHaveBeenCalledWith(["a", "c"]);

    await waitFor(() => {
      const propsAfter = getLastDataGridProps();
      expect(new Set(Array.from(propsAfter.rowSelectionModel.ids))).toEqual(
        new Set(["a", "c"])
      );
    });
  });

  it("selección MULTI con ids numéricos convierte a string[] en toggleSelect", async () => {
    const toggleSelect = vi.fn();

    render(
      <GridSection
        data={[{ id: 10 }, { id: 20 }]}
        loading={false}
        columns={cols as any}
        onSearch={vi.fn()}
        toggleSelect={toggleSelect}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        entityName="Nums"
        fetchAll={vi.fn()}
        fetchByText={vi.fn()}
        multiSelect
      />
    );

    const propsBefore = getLastDataGridProps();
    await act(async () => {
      await propsBefore.onRowSelectionModelChange?.({
        type: "include",
        ids: new Set([10, 20]),
      });
    });

    expect(toggleSelect).toHaveBeenCalledWith(["10", "20"]);
  });

  it("no rompe si no se provee toggleSelect y aún así actualiza rowSelectionModel", async () => {
    render(
      <GridSection
        data={[{ id: "x" }, { id: "y" }]}
        loading={false}
        columns={cols as any}
        onSearch={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        entityName="Safe"
        fetchAll={vi.fn()}
        fetchByText={vi.fn()}
        multiSelect
      />
    );

    const propsBefore = getLastDataGridProps();
    await act(async () => {
      await propsBefore.onRowSelectionModelChange?.({
        type: "include",
        ids: new Set(["x"]),
      });
    });

    await waitFor(() => {
      const propsAfter = getLastDataGridProps();
      expect(Array.from(propsAfter.rowSelectionModel.ids)).toEqual(["x"]);
    });
  });

  it("sincroniza cuando selectedIds pasa de undefined a definido", async () => {
    const { rerender } = render(
      <GridSection
        data={[{ id: "a" }, { id: "b" }]}
        loading={false}
        columns={cols as any}
        onSearch={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        entityName="Sync"
        fetchAll={vi.fn()}
        fetchByText={vi.fn()}
        multiSelect
      />
    );

    rerender(
      <GridSection
        data={[{ id: "a" }, { id: "b" }]}
        loading={false}
        columns={cols as any}
        onSearch={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        entityName="Sync"
        fetchAll={vi.fn()}
        fetchByText={vi.fn()}
        multiSelect
        selectedIds={["b"]}
      />
    );

    await waitFor(() => {
      const props = getLastDataGridProps();
      expect(Array.from(props.rowSelectionModel.ids)).toEqual(["b"]);
    });
  });

  it("Modal: invoca onClose proporcionado por GridSection (cubre setModalOpen(false))", () => {
    render(
      <GridSection
        data={[]}
        loading={false}
        columns={cols as any}
        onSearch={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        entityName="Modal"
        fetchAll={vi.fn()}
        fetchByText={vi.fn()}
      />
    );

    const [modalProps] = (Modal as Mock).mock.calls.at(-1)!;
    expect(typeof modalProps.onClose).toBe("function");

    modalProps.onClose();
  });

  it("pasa props clave a DataGrid", () => {
    const data = [{ id: 10 }, { id: 20 }];

    render(
      <GridSection
        data={data}
        loading={false}
        columns={cols as any}
        onSearch={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        entityName="Items"
        fetchAll={vi.fn()}
        fetchByText={vi.fn()}
      />
    );

    const props = getLastDataGridProps();
    expect(props.rows).toEqual(data);
    expect(props.columns).toEqual(cols);
    expect(props.checkboxSelection).toBe(true);
    expect(props.pageSizeOptions).toEqual([5]);
    expect(props.paginationModel.pageSize).toBe(5);
    expect(typeof props.onRowSelectionModelChange).toBe("function");
  });
});
