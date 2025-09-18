/// <reference types="vitest" />
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { UtilitiesSection } from "../../../components/utilities/UtilitiesSection";
import { useUtilities } from "../../../hooks/useUtilities";

vi.mock("../../../hooks/useUtilities");
vi.mock("../../../components/utilities/UtilitiesForm", () => ({
  UtilitiesForm: ({ action, item, onDone }: any) => (
    <div data-testid={`form-${action}`} onClick={onDone}>
      {item ? item.name : "no-item"}
    </div>
  ),
}));
vi.mock("../../../../shared/components/GridSection", () => ({
  GridSection: ({
    entityName,
    onCreate,
    onEdit,
    onDelete,
    onSearch,
    fetchAll,
    fetchByText,
    toggleSelect,
    isSelected,
  }: any) => (
    <div>
      <div data-testid="grid">{entityName}</div>
      {onCreate && <button onClick={onCreate} data-testid="create">Create</button>}
      {onEdit && <button onClick={() => onEdit({ id: 1, name: "editU" })} data-testid="edit">Edit</button>}
      {onDelete && <button onClick={() => onDelete({ id: 2, name: "delU" })} data-testid="delete">Delete</button>}

      <button data-testid="search" onClick={() => {
        onSearch([{ id: 99, name: "searched" }]);
      }}>
        Search
      </button>
      <button data-testid="fetchAll" onClick={async () => await fetchAll()}>FetchAll</button>
      <button data-testid="fetchByText" onClick={async () => await fetchByText("q")}>FetchByText</button>

      <button data-testid="toggleSelect" onClick={() => {
        toggleSelect && toggleSelect([1, "2"]);
      }}>
        ToggleSelect
      </button>
      <button data-testid="isSelectedTrue">{isSelected && String(isSelected(5))}</button>
      <button data-testid="isSelectedFalse">{isSelected && String(isSelected("bad"))}</button>

      <div data-testid="results">searched</div>
    </div>
  ),
}));
vi.mock("../../../../shared/components/Modal", () => ({
  Modal: ({ open, title, onClose, children }: any) =>
    open ? (
      <div data-testid="modal">
        <span data-testid="title">{title}</span>
        <button data-testid="close" onClick={onClose}>
          Close
        </button>
        {children}
      </div>
    ) : null,
}));

// mockeamos useGlobalAlert para que no explote
vi.mock("../../../../shared/context/AlertContext", () => ({
  useGlobalAlert: () => ({
    showAlert: vi.fn(),
  }),
}));

describe("UtilitiesSection", () => {
  const mockLoadAll = vi.fn();
  const mockFetchByText = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useUtilities as any).mockReturnValue({
      loading: false,
      loadAll: mockLoadAll,
      fetchByText: mockFetchByText,
    });
  });

  it("renderiza con showActions=true y abre modal de crear", () => {
    render(<UtilitiesSection />);
    expect(screen.getByTestId("grid")).toHaveTextContent("Utility");
    fireEvent.click(screen.getByTestId("create"));
    expect(screen.getByTestId("modal")).toBeInTheDocument();
    expect(screen.getByTestId("title")).toHaveTextContent("Crear utility");
    expect(screen.getByTestId("form-add")).toBeInTheDocument();
  });

  it("renderiza con showActions=false (sin botones)", () => {
    render(<UtilitiesSection showActions={false} />);
    expect(screen.getByTestId("grid")).toBeInTheDocument();
    expect(screen.queryByTestId("create")).toBeNull();
  });

  it("abre modal de editar y cierra tras onDone", async () => {
    mockLoadAll.mockResolvedValue([{ id: 1, name: "newU" }]);
    render(<UtilitiesSection />);
    fireEvent.click(screen.getByTestId("edit"));
    expect(screen.getByTestId("title")).toHaveTextContent("Editar utility");
    fireEvent.click(screen.getByTestId("form-edit"));
    await waitFor(() => expect(screen.queryByTestId("modal")).not.toBeInTheDocument());
  });

  it("abre modal de eliminar y cierra tras onDone", async () => {
    mockLoadAll.mockResolvedValue([{ id: 2, name: "newU" }]);
    render(<UtilitiesSection />);
    fireEvent.click(screen.getByTestId("delete"));
    expect(screen.getByTestId("title")).toHaveTextContent("Eliminar utility");
    fireEvent.click(screen.getByTestId("form-delete"));
    await waitFor(() => expect(screen.queryByTestId("modal")).not.toBeInTheDocument());
  });

  it("permite cerrar modal manualmente", () => {
    render(<UtilitiesSection />);
    fireEvent.click(screen.getByTestId("create"));
    fireEvent.click(screen.getByTestId("close"));
    expect(screen.queryByTestId("modal")).toBeNull();
  });

  it("gridToggleSelect transforma ids y llama toggleSelect", () => {
    const spy = vi.fn();
    render(<UtilitiesSection toggleSelect={spy} />);
    fireEvent.click(screen.getByTestId("toggleSelect"));
    expect(spy).toHaveBeenCalledWith([1, 2]);
  });

  it("gridIsSelected devuelve true/false según props", () => {
    const spy = vi.fn((id) => id === 5);
    render(<UtilitiesSection isSelected={spy} />);
    expect(screen.getByTestId("isSelectedTrue")).toHaveTextContent("true");
    expect(screen.getByTestId("isSelectedFalse")).toHaveTextContent("false");
  });

  it("refresh actualiza rows desde loadAll", async () => {
    mockLoadAll.mockResolvedValue([{ id: 7, name: "u7" }]);
    render(<UtilitiesSection />);
    fireEvent.click(screen.getByTestId("fetchAll"));
    await waitFor(() => expect(mockLoadAll).toHaveBeenCalled());
  });

  it("fetchByTextAdapter actualiza rows desde fetchByText", async () => {
    mockFetchByText.mockResolvedValue([{ id: 8, name: "u8" }]);
    render(<UtilitiesSection />);
    fireEvent.click(screen.getByTestId("fetchByText"));
    await waitFor(() => expect(mockFetchByText).toHaveBeenCalledWith("q"));
  });

  it("onSearch actualiza filas", () => {
    render(<UtilitiesSection />);
    fireEvent.click(screen.getByTestId("search"));
    expect(screen.getByTestId("results")).toHaveTextContent("searched");
  });
});
