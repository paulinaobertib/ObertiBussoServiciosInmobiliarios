/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { GuarantorsSection } from "../../../../user/components/guarantors/GuarantorsSection";

// --- Mocks ---
let mockGuarantors: any[] = [];
let mockLoading = false;
const mockLoadAll = vi.fn();
const mockFetchByText = vi.fn();

vi.mock("../../../hooks/useGuarantors", () => ({
  useGuarantors: () => ({
    guarantors: mockGuarantors,
    loading: mockLoading,
    loadAll: mockLoadAll,
    fetchByText: mockFetchByText,
  }),
}));

// Mock GridSection
const GridSectionMock = vi.fn((props: any) => (
  <div data-testid="grid-section">
    <button onClick={props.onCreate}>create</button>
    <button onClick={() => props.onEdit({ id: 1, name: "John" })}>edit</button>
    <button onClick={() => props.onDelete({ id: 1, name: "John" })}>delete</button>
    <div>rows: {props.data.map((r: any) => r.id).join(",")}</div>
    <div>actions: {props.showActions ? "yes" : "no"}</div>
  </div>
));
vi.mock("../../../../shared/components/GridSection", () => ({
  GridSection: (props: any) => GridSectionMock(props),
}));

// ⚠️ Ruta correcta: misma carpeta donde está GuarantorsSection
vi.mock("../../../../user/components/guarantors/GuarantorDialog", () => ({
  GuarantorDialog: (props: any) => (
    <div data-testid="guarantor-dialog">
      open={String(props.open)} mode={props.mode}
      <button onClick={props.onClose}>close</button>
      <button onClick={props.onSaved}>saved</button>
    </div>
  ),
}));

describe("GuarantorsSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGuarantors = [{ id: 1, name: "John", email: "a@b.com", phone: "123" }];
    mockLoading = false;
  });

  it("muestra spinner cuando loading=true y no hay rows", () => {
    mockLoading = true;
    mockGuarantors = [];
    render(<GuarantorsSection />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("renderiza GridSection con rows y acciones activadas", () => {
    render(<GuarantorsSection />);
    expect(screen.getByTestId("grid-section")).toBeInTheDocument();
    expect(screen.getByText("rows: 1")).toBeInTheDocument();
    expect(screen.getByText("actions: yes")).toBeInTheDocument();
  });

  it("abre diálogo en modo add", () => {
    render(<GuarantorsSection />);
    fireEvent.click(screen.getByText("create"));
    expect(screen.getByTestId("guarantor-dialog")).toHaveTextContent("mode=add");
  });

  it("abre diálogo en modo edit", () => {
    render(<GuarantorsSection />);
    fireEvent.click(screen.getByText("edit"));
    expect(screen.getByTestId("guarantor-dialog")).toHaveTextContent("mode=edit");
  });

  it("abre diálogo en modo delete", () => {
    render(<GuarantorsSection />);
    fireEvent.click(screen.getByText("delete"));
    expect(screen.getByTestId("guarantor-dialog")).toHaveTextContent("mode=delete");
  });

  it("onSaved refresca con loadAll y cierra diálogo", async () => {
    render(<GuarantorsSection />);
    fireEvent.click(screen.getByText("create"));
    fireEvent.click(screen.getByText("saved"));
    await waitFor(() => {
      expect(mockLoadAll).toHaveBeenCalled();
      expect(screen.getByTestId("guarantor-dialog")).toHaveTextContent("open=false");
    });
  });

  it("onClose cierra diálogo", () => {
    render(<GuarantorsSection />);
    fireEvent.click(screen.getByText("create"));
    fireEvent.click(screen.getByText("close"));
    expect(screen.getByTestId("guarantor-dialog")).toHaveTextContent("open=false");
  });

  it("no muestra columna actions cuando showActions=false", () => {
    render(<GuarantorsSection showActions={false} />);
    expect(screen.getByText("actions: no")).toBeInTheDocument();
  });
});
