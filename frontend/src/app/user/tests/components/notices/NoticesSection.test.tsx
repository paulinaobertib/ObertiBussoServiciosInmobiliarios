import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import NoticesSection from "../../../components/notices/NoticesSection";
import { useNotices } from "../../../hooks/useNotices";
import { useAuthContext } from "../../../../user/context/AuthContext";
import { useConfirmDialog } from "../../../../shared/components/ConfirmDialog";

// ----- Mocks -----
vi.mock("../../../hooks/useNotices");
vi.mock("../../../../user/context/AuthContext");
vi.mock("../../../../shared/components/ConfirmDialog", () => ({
  useConfirmDialog: vi.fn(),
}));
vi.mock("../../../shared/components/Modal", () => ({
  Modal: ({ children }: any) => <div>{children}</div>,
}));
vi.mock("../NoticeForm", () => ({
  NoticeForm: React.forwardRef((ref) => (
    <input ref={ref as any} data-testid="notice-form" />
  )),
}));

describe("NoticesSection", () => {
  const addMock = vi.fn();
  const editMock = vi.fn();
  const removeMock = vi.fn();
  const fetchAllMock = vi.fn();
  const searchMock = vi.fn();
  const askMock = vi.fn();
  const DialogUI = <div>DialogUI</div>;

  beforeEach(() => {
    vi.clearAllMocks();
    (useNotices as any).mockReturnValue({
      notices: [
        { id: 1, title: "N1", description: "Desc1", date: new Date(), userId: 1 },
        { id: 2, title: "N2", description: "Desc2", date: new Date(), userId: 2 },
      ],
      add: addMock,
      edit: editMock,
      remove: removeMock,
      fetchAll: fetchAllMock,
      search: searchMock,
    });
    (useAuthContext as any).mockReturnValue({ isAdmin: true, info: { id: 1 } });
    (useConfirmDialog as any).mockReturnValue({ ask: askMock, DialogUI });
  });

  it("muestra las novedades y el slider inicial", () => {
    render(
      <MemoryRouter>
        <NoticesSection />
      </MemoryRouter>
    );
    expect(screen.getByText("Nueva novedad")).toBeInTheDocument();
    expect(screen.getByText("N1")).toBeInTheDocument();
    expect(screen.getByText("N2")).toBeInTheDocument();
  });

  it("navega con flechas del slider", () => {
    render(
      <MemoryRouter>
        <NoticesSection />
      </MemoryRouter>
    );
    const buttons = screen.getAllByRole("button");
    const left = buttons.find(b => b.querySelector("svg[data-testid='ChevronLeftIcon']"));
    const right = buttons.find(b => b.querySelector("svg[data-testid='ChevronRightIcon']"));

    // izquierda deshabilitada al inicio
    if (left) expect(left).toBeDisabled();
    // derecha habilitada si hay más elementos que visibleCount
    if (right) fireEvent.click(right);
    if (left) fireEvent.click(left);
  });

  it("SearchBar se renderiza y placeholder correcto", () => {
    render(
      <MemoryRouter>
        <NoticesSection />
      </MemoryRouter>
    );
    expect(screen.getByPlaceholderText(/Buscar novedades/i)).toBeInTheDocument();
  });

    it("no muestra el botón 'Nueva novedad' si el usuario NO es admin", () => {
    (useAuthContext as any).mockReturnValueOnce({ isAdmin: false, info: { id: 1 } });

    render(
      <MemoryRouter>
        <NoticesSection />
      </MemoryRouter>
    );

    expect(screen.queryByText("Nueva novedad")).toBeNull();
  });

  it("abre el modal al clickear 'Nueva novedad' y el botón 'Crear' arranca deshabilitado", () => {
    // admin por defecto (mock del beforeEach)
    render(
      <MemoryRouter>
        <NoticesSection />
      </MemoryRouter>
    );

    // Abrimos el modal
    fireEvent.click(screen.getByText("Nueva novedad"));

    // Como el Modal mock devuelve {children}, el contenido del modal queda en el árbol
    const crearBtn = screen.getByRole("button", { name: /^Crear$/i });
    expect(crearBtn).toBeInTheDocument();
    expect(crearBtn).toBeDisabled();
  });

  it("muestra flechas del slider y la flecha derecha está deshabilitada si no hay más ítems", () => {
    // Con 2 ítems y visibleCount por defecto (>=2), la derecha debería estar deshabilitada
    render(
      <MemoryRouter>
        <NoticesSection />
      </MemoryRouter>
    );

    // Localizamos botones por los iconos renderizados
    const allButtons = screen.getAllByRole("button");
    const left = allButtons.find((b) =>
      b.querySelector("svg[data-testid='ChevronLeftIcon']")
    );
    const right = allButtons.find((b) =>
      b.querySelector("svg[data-testid='ChevronRightIcon']")
    );

    // Existen
    expect(left).toBeDefined();
    expect(right).toBeDefined();

    // izquierda está deshabilitada al inicio (idx=0)
    if (left) expect(left).toBeDisabled();
    // derecha NO debería permitir avanzar (no hay suficientes items para siguiente página)
    if (right) expect(right).toBeDisabled();
  });

  it("las flechas del slider están presentes en el DOM (sanity check)", () => {
    render(
      <MemoryRouter>
        <NoticesSection />
      </MemoryRouter>
    );

    // al menos una instancia de cada icono dentro de un botón
    expect(
      screen.getAllByRole("button").some((b) =>
        b.querySelector("svg[data-testid='ChevronLeftIcon']")
      )
    ).toBe(true);
    expect(
      screen.getAllByRole("button").some((b) =>
        b.querySelector("svg[data-testid='ChevronRightIcon']")
      )
    ).toBe(true);
  });

    it("muestra el DialogUI del confirm dialog en el árbol", () => {
    render(
      <MemoryRouter>
        <NoticesSection />
      </MemoryRouter>
    );
    // viene del mock de useConfirmDialog en beforeEach
    expect(screen.getByText("DialogUI")).toBeInTheDocument();
  });

  it("si hay 0 noticias, ambas flechas están deshabilitadas y no rompe", () => {
    // cambiamos implementación solo para este test
    (useNotices as any).mockImplementation(() => ({
      notices: [],
      add: vi.fn(),
      edit: vi.fn(),
      remove: vi.fn(),
      fetchAll: vi.fn(),
      search: vi.fn(),
    }));

    render(
      <MemoryRouter>
        <NoticesSection />
      </MemoryRouter>
    );

    const buttons = screen.getAllByRole("button");
    const left = buttons.find(b => b.querySelector("svg[data-testid='ChevronLeftIcon']"));
    const right = buttons.find(b => b.querySelector("svg[data-testid='ChevronRightIcon']"));

    expect(left).toBeDefined();
    expect(right).toBeDefined();
    if (left) expect(left).toBeDisabled();
    if (right) expect(right).toBeDisabled();
  });

  it("resetea el índice cuando cambia la lista de notices (de 6 a 2 items)", () => {
    // variable mutable que el mock devolverá en cada render
    let currentNotices = [
      { id: 1, title: "N1", description: "d1", date: new Date("2025-06-10"), userId: 1 },
      { id: 2, title: "N2", description: "d2", date: new Date("2025-06-09"), userId: 2 },
      { id: 3, title: "N3", description: "d3", date: new Date("2025-06-08"), userId: 1 },
      { id: 4, title: "N4", description: "d4", date: new Date("2025-06-07"), userId: 2 },
      { id: 5, title: "N5", description: "d5", date: new Date("2025-06-06"), userId: 1 },
      { id: 6, title: "N6", description: "d6", date: new Date("2025-06-05"), userId: 2 },
    ];

    (useNotices as any).mockImplementation(() => ({
      notices: currentNotices,
      add: vi.fn(),
      edit: vi.fn(),
      remove: vi.fn(),
      fetchAll: vi.fn(),
      search: vi.fn(),
    }));

    const { rerender } = render(
      <MemoryRouter>
        <NoticesSection />
      </MemoryRouter>
    );

    // avanzamos una página (si visibleCount >= 2, habrá paso)
    const buttons = screen.getAllByRole("button");
    const right = buttons.find(b => b.querySelector("svg[data-testid='ChevronRightIcon']"));
    const left = buttons.find(b => b.querySelector("svg[data-testid='ChevronLeftIcon']"));
    if (right) fireEvent.click(right);

    // ahora "simulamos" que la lista cambia y se vuelve más corta (2 noticias)
    currentNotices = [
      { id: 10, title: "X1", description: "dx1", date: new Date("2025-06-10"), userId: 3 },
      { id: 20, title: "X2", description: "dx2", date: new Date("2025-06-09"), userId: 4 },
    ];

    rerender(
      <MemoryRouter>
        <NoticesSection />
      </MemoryRouter>
    );

    // debería resetear a idx=0 → izquierda deshabilitada
    if (left) expect(left).toBeDisabled();
    // y como no hay más páginas, derecha deshabilitada
    if (right) expect(right).toBeDisabled();
  });

  it("oculta el botón 'Nueva novedad' cuando isAdmin=false", () => {
    (useAuthContext as any).mockReturnValueOnce({ isAdmin: false, info: { id: 1 } });

    render(
      <MemoryRouter>
        <NoticesSection />
      </MemoryRouter>
    );

    expect(screen.queryByText("Nueva novedad")).toBeNull();
  });


});
