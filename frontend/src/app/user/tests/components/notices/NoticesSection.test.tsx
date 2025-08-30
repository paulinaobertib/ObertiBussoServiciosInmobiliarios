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
vi.mock("../../../components/notices/NoticeForm", () => ({
  NoticeForm: React.forwardRef(({ onValidityChange }: any, ref: any) => {
    const setRef = (el: any) => {
      if (el) {
        // lo que leerá handleCreate()
        el.getCreateData = () => ({
          title: "Título test",
          description: "Desc test",
          date: new Date("2025-06-01T10:00:00.000Z"),
        });
      }
      if (typeof ref === "function") ref(el);
      else if (ref) ref.current = el;
    };

    return (
      <div>
        <div ref={setRef} data-testid="notice-form" />
        <button
          data-testid="mark-valid"
          onClick={() => onValidityChange?.(true)}
        >
          mark-valid
        </button>
      </div>
    );
  }),
}));
vi.mock("../../../components/notices/NoticesList", () => ({
  NoticesList: ({ notices, onDeleteClick, visibleCount }: any) => (
    <div>
      <div data-testid="visible-count">{visibleCount}</div>
      <div data-testid="list-order">{notices.map((n: any) => n.title).join(",")}</div>
      <button data-testid="trigger-delete" onClick={() => onDeleteClick(123)}>
        eliminar
      </button>
    </div>
  ),
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

it('admin: abre modal, marca válido, habilita "Crear" y llama add con userId', () => {
  // Fuerza el userId que esperás para todas las llamadas de este test
  (useAuthContext as any).mockReturnValue({ isAdmin: true, info: { id: 777 } });

  // También forzamos loading=false para que el botón pueda habilitarse
  (useNotices as any).mockReturnValue({
    notices: [],
    add: addMock,
    edit: editMock,
    remove: removeMock,
    fetchAll: fetchAllMock,
    search: searchMock,
    loading: false,
  });

  render(
    <MemoryRouter>
      <NoticesSection />
    </MemoryRouter>
  );

  // Abre el modal de creación
  fireEvent.click(screen.getByRole('button', { name: /Nueva noticia/i }));

  // Marcamos el form como válido (usa tu mock de NoticeForm)
  fireEvent.click(screen.getByTestId('mark-valid'));

  // Botón habilitado
  const crearBtn = screen.getByRole('button', { name: 'Crear' });
  expect(crearBtn).not.toBeDisabled();

  // Click en Crear
  fireEvent.click(crearBtn);

  expect(addMock).toHaveBeenCalledTimes(1);
  const payload = addMock.mock.calls[0][0];

  // Verifica que usa el userId del contexto
  expect(payload).toMatchObject({
    title: 'Título test',
    description: 'Desc test',
    userId: 777,
  });
});

it("muestra 'Crear' deshabilitado cuando el formulario NO es válido (canCreate=false), incluso con loading=true", () => {
  (useAuthContext as any).mockReturnValue({ isAdmin: true, info: { id: 1 } });

  // loading=true, pero como canCreate=false, el botón debe estar deshabilitado
  (useNotices as any).mockReturnValue({
    notices: [],
    add: addMock,
    edit: editMock,
    remove: removeMock,
    fetchAll: fetchAllMock,
    search: searchMock,
    loading: true,
  });

  render(
    <MemoryRouter>
      <NoticesSection />
    </MemoryRouter>
  );

  // Abrimos modal
  fireEvent.click(screen.getByRole('button', { name: /Nueva noticia/i }));

  // NO marcamos válido (no tocamos mark-valid)
  const crearBtn = screen.getByRole('button', { name: 'Crear' });
  expect(crearBtn).toBeDisabled(); // deshabilitado por canCreate=false
});

it("delete: dispara confirmación (ask) y ejecuta remove al confirmar", () => {
  (useAuthContext as any).mockReturnValueOnce({ isAdmin: true, info: { id: 1 } });
  (useNotices as any).mockReturnValueOnce({
    notices: [{ id: 9, title: "A", date: new Date(), userId: 1 }],
    add: addMock,
    edit: editMock,
    remove: removeMock,
    fetchAll: fetchAllMock,
    search: searchMock,
    loading: false,
  });

  const confirmSpy = vi.fn(); // función que simula "Confirmar"
  (useConfirmDialog as any).mockReturnValueOnce({
    ask: (_msg: string, onConfirm: () => void) => {
      confirmSpy.mockImplementation(onConfirm);
      // guardamos el callback y lo ejecutaremos más abajo
    },
    DialogUI,
  });

  render(
    <MemoryRouter>
      <NoticesSection />
    </MemoryRouter>
  );

  // trigger delete desde nuestro NoticesList mock
  fireEvent.click(screen.getByTestId("trigger-delete"));
  // el onConfirm real sería llamado por el diálogo al confirmar:
  confirmSpy(); // ejecutamos el callback guardado
  expect(removeMock).toHaveBeenCalledWith(123);
});

it("envía las noticias a NoticesList ordenadas por fecha desc", () => {
  (useAuthContext as any).mockReturnValueOnce({ isAdmin: true, info: { id: 1 } });
  (useNotices as any).mockReturnValueOnce({
    notices: [
      { id: 1, title: "Vieja", date: new Date("2025-01-01T09:00:00Z"), userId: 1 },
      { id: 2, title: "Nueva", date: new Date("2025-06-01T09:00:00Z"), userId: 1 },
      { id: 3, title: "Media", date: new Date("2025-03-01T09:00:00Z"), userId: 1 },
    ],
    add: addMock,
    edit: editMock,
    remove: removeMock,
    fetchAll: fetchAllMock,
    search: searchMock,
    loading: false,
  });

  render(
    <MemoryRouter>
      <NoticesSection />
    </MemoryRouter>
  );

  // nuestro mock de NoticesList imprime el orden recibido
  const order = screen.getByTestId("list-order").textContent;
  expect(order).toBe("Nueva,Media,Vieja");
});

});
