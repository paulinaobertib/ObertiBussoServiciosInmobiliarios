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
        <button data-testid="mark-valid" onClick={() => onValidityChange?.(true)}>
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
      loading: false,
    });
    (useAuthContext as any).mockReturnValue({ isAdmin: true, info: { id: 1 } });
    (useConfirmDialog as any).mockReturnValue({
      ask: vi.fn(),
      DialogUI: <div data-testid="dialog-ui">DialogUI</div>,
    });
  });

  it("navega con flechas del slider", () => {
    render(
      <MemoryRouter>
        <NoticesSection />
      </MemoryRouter>
    );
    const buttons = screen.getAllByRole("button");
    const left = buttons.find((b) => b.querySelector("svg[data-testid='ChevronLeftIcon']"));
    const right = buttons.find((b) => b.querySelector("svg[data-testid='ChevronRightIcon']"));

    if (left) expect(left).toBeDisabled();
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

  it("no muestra el botón 'Nueva noticia' si el usuario NO es admin", () => {
    (useAuthContext as any).mockReturnValueOnce({ isAdmin: false, info: { id: 1 } });

    render(
      <MemoryRouter>
        <NoticesSection />
      </MemoryRouter>
    );

    expect(screen.queryByText("Nueva noticia")).toBeNull();
  });

  it("muestra flechas del slider y la derecha está deshabilitada si no hay más ítems", () => {
    render(
      <MemoryRouter>
        <NoticesSection />
      </MemoryRouter>
    );

    const allButtons = screen.getAllByRole("button");
    const left = allButtons.find((b) => b.querySelector("svg[data-testid='ChevronLeftIcon']"));
    const right = allButtons.find((b) => b.querySelector("svg[data-testid='ChevronRightIcon']"));

    expect(left).toBeDefined();
    expect(right).toBeDefined();
    if (left) expect(left).toBeDisabled();
    if (right) expect(right).toBeDisabled();
  });

  it("si hay 0 noticias, muestra el mensaje sin flechas", () => {
    (useNotices as any).mockReturnValueOnce({
      notices: [],
      add: vi.fn(),
      edit: vi.fn(),
      remove: vi.fn(),
      fetchAll: vi.fn(),
      search: vi.fn(),
      loading: false,
    });

    render(
      <MemoryRouter>
        <NoticesSection />
      </MemoryRouter>
    );

    expect(screen.getByText("No hay novedades disponibles.")).toBeInTheDocument();
    expect(screen.queryAllByRole("button").some((b) => b.querySelector("svg[data-testid='ChevronLeftIcon']"))).toBe(
      false
    );
  });

  it("resetea el índice cuando cambia la lista de notices (de 6 a 2 items)", () => {
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
      loading: false,
    }));

    const { rerender } = render(
      <MemoryRouter>
        <NoticesSection />
      </MemoryRouter>
    );

    const buttons = screen.getAllByRole("button");
    const right = buttons.find((b) => b.querySelector("svg[data-testid='ChevronRightIcon']"));
    const left = buttons.find((b) => b.querySelector("svg[data-testid='ChevronLeftIcon']"));
    if (right) fireEvent.click(right);

    currentNotices = [
      { id: 10, title: "X1", description: "dx1", date: new Date("2025-06-10"), userId: 3 },
      { id: 20, title: "X2", description: "dx2", date: new Date("2025-06-09"), userId: 4 },
    ];

    rerender(
      <MemoryRouter>
        <NoticesSection />
      </MemoryRouter>
    );

    if (left) expect(left).toBeDisabled();
    if (right) expect(right).toBeDisabled();
  });

  it('admin: abre modal, marca válido, habilita "Crear" y llama add con userId', () => {
    (useAuthContext as any).mockReturnValue({ isAdmin: true, info: { id: 777 } });
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

    fireEvent.click(screen.getByRole("button", { name: /Nueva noticia/i }));
    fireEvent.click(screen.getByTestId("mark-valid"));

    const crearBtn = screen.getByRole("button", { name: "Crear" });
    expect(crearBtn).not.toBeDisabled();
    fireEvent.click(crearBtn);

    expect(addMock).toHaveBeenCalledTimes(1);
    const payload = addMock.mock.calls[0][0];
    expect(payload).toMatchObject({
      title: "Título test",
      description: "Desc test",
      userId: 777,
    });
  });

  it("muestra 'Crear' deshabilitado cuando canCreate=false aunque loading=true", () => {
    (useAuthContext as any).mockReturnValue({ isAdmin: true, info: { id: 1 } });
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

    fireEvent.click(screen.getByRole("button", { name: /Nueva noticia/i }));
    const crearBtn = screen.getByRole("button", { name: "Crear" });
    expect(crearBtn).toBeDisabled();
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

    const confirmSpy = vi.fn();
    (useConfirmDialog as any).mockReturnValueOnce({
      ask: (_msg: string, onConfirm: () => void) => confirmSpy.mockImplementation(onConfirm),
      DialogUI: <div data-testid="dialog-ui">DialogUI</div>,
    });

    render(
      <MemoryRouter>
        <NoticesSection />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByTestId("trigger-delete"));
    confirmSpy();
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

    const order = screen.getByTestId("list-order").textContent;
    expect(order).toBe("Nueva,Media,Vieja");
  });
});
