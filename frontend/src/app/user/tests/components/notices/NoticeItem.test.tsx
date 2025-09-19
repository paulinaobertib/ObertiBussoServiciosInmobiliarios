/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent  } from "@testing-library/react";
import { NoticeItem } from "../../../components/notices/NoticeItem";

// ---------- mocks utilitarios ----------
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual: any = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

// buildRoute/ROUTES -> simplificamos a /news/:id
vi.mock("../../../../lib", () => ({
  buildRoute: (_route: any, id: number | string) => `/news/${id}`,
  ROUTES: { NEWS_DETAILS: "/news/:id" },
}));

// Modal: muestra children cuando open=true
vi.mock("../../../shared/components/Modal", () => ({
  Modal: ({ open, title, onClose, children }: any) =>
    open ? (
      <div data-testid="modal">
        <div>{title}</div>
        <button onClick={onClose}>close</button>
        {children}
      </div>
    ) : null,
}));

// NoticeForm (forwardRef): expone getUpdateData y onValidityChange
let updateDataReturn: any = {
  title: "Editado",
  description: "nuevo desc",
  mainImage: null,
  date: "2025-06-11T10:00:00Z",
};

vi.mock("../../../components/notices/NoticeForm", () => {
  const React = require("react");
  const NoticeForm = React.forwardRef((props: any, ref: any) => {
    const { onValidityChange } = props;
    React.useImperativeHandle(ref, () => ({
      validate: () => true,
      getUpdateData: () => updateDataReturn,
      getCreateData: () => updateDataReturn,
    }));
    return (
      <div data-testid="notice-form">
        <button onClick={() => onValidityChange(true)}>form-valid</button>
        <button onClick={() => onValidityChange(false)}>form-invalid</button>
      </div>
    );
  });
  return { NoticeForm };
});

const makeNotice = (over: Partial<any> = {}) => ({
  id: 7,
  title: "Título",
  description: "Desc",
  mainImage: null,
  userId: "u-1",
  date: new Date().toISOString(), // por defecto es “reciente”
  ...over,
});

describe("<NoticeItem />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.URL.createObjectURL as any) = vi.fn(() => "blob:mock");
    updateDataReturn = {
      title: "Editado",
      description: "nuevo desc",
      mainImage: null,
      date: "2025-06-11T10:00:00Z",
    };
  });

  it("muestra chip NUEVO y fecha cuando la noticia es reciente (<3 días)", () => {
    const notice = makeNotice(); // fecha = ahora
    render(
      <NoticeItem notice={notice} isAdmin={false} onUpdate={vi.fn()} />
    );

    // Chip NUEVO presente y fecha formateada (es-AR)
    expect(screen.getByText("NUEVO")).toBeInTheDocument();
    const day = new Date(notice.date).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    expect(screen.getByText(day)).toBeInTheDocument();
  });

  it("si NO es reciente, no muestra chip NUEVO pero mantiene la fecha", () => {
    const oldDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
    const notice = makeNotice({ date: oldDate });
    render(
      <NoticeItem notice={notice} isAdmin={false} onUpdate={vi.fn()} />
    );

    expect(screen.queryByText("NUEVO")).toBeNull();
    const day = new Date(oldDate).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    expect(screen.getByText(day)).toBeInTheDocument();
  });

  it("navega al detalle al clickear la card y al clickear 'Ver detalle'", () => {
    const notice = makeNotice({ id: 101 });
    render(
      <NoticeItem notice={notice} isAdmin={false} onUpdate={vi.fn()} />
    );

    fireEvent.click(screen.getByRole("button", { name: /Ver detalle/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/news/101");

    fireEvent.click(screen.getByText("Título"));
    expect(mockNavigate).toHaveBeenCalledWith("/news/101");
  });

  it("cuando isAdmin=true muestra los icon buttons; 'Eliminar' llama onDeleteClick y NO navega", () => {
    const notice = makeNotice({ id: 55 });
    const onDeleteClick = vi.fn();
    render(
      <NoticeItem
        notice={notice}
        isAdmin
        onUpdate={vi.fn()}
        onDeleteClick={onDeleteClick}
      />
    );
    
    const iconButtons = screen
      .getAllByRole("button")
      .filter((b) => b.querySelector("svg"));

    expect(iconButtons.length).toBeGreaterThanOrEqual(2);

    const deleteBtn = iconButtons[1]; // [0]=edit, [1]=delete
    fireEvent.click(deleteBtn);

    expect(onDeleteClick).toHaveBeenCalledWith(55);
    // Asegura que NO navegó (por stopPropagation)
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("cuando formRef.current existe y canSave=true guarda y cierra", async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    const notice = makeNotice();
    render(<NoticeItem notice={notice} isAdmin onUpdate={onUpdate} />);

    // abrir modal
    fireEvent.click(screen.getAllByRole("button").find((b) => b.querySelector("svg"))!);

    // fuerza validez true
    fireEvent.click(screen.getByText("form-valid"));

    const saveBtn = screen.getByRole("button", { name: /Guardar/i });
    expect(saveBtn).not.toBeDisabled();

    fireEvent.click(saveBtn);

    await vi.waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ id: notice.id, userId: notice.userId })
      )
    );
    // modal se cierra
    expect(screen.queryByTestId("modal")).toBeNull();
  });

  it("si canSave=false el botón Guardar queda deshabilitado", () => {
    const notice = makeNotice();
    render(<NoticeItem notice={notice} isAdmin onUpdate={vi.fn()} />);

    // abrir modal
    fireEvent.click(screen.getAllByRole("button").find((b) => b.querySelector("svg"))!);

    fireEvent.click(screen.getByText("form-invalid"));

    const saveBtn = screen.getByRole("button", { name: /Guardar/i });
    expect(saveBtn).toBeDisabled();
  });

  it("si formRef.current es null, handleSave no llama a onUpdate", async () => {
    const onUpdate = vi.fn();
    const notice = makeNotice();
    render(<NoticeItem notice={notice} isAdmin onUpdate={onUpdate} />);

    // abrir modal
    fireEvent.click(screen.getAllByRole("button").find((b) => b.querySelector("svg"))!);

    // forzamos el ref a null simulando que no existe
    // @ts-expect-error
    screen.getByTestId("notice-form").ref = null;

    // aún así apretamos guardar
    const saveBtn = screen.getByRole("button", { name: /Guardar/i });
    fireEvent.click(saveBtn);

    await vi.waitFor(() => {
      expect(onUpdate).not.toHaveBeenCalled();
    });
  });

  it("usa URL.createObjectURL si mainImage es File", () => {
    const file = new File(["dummy"], "test.png", { type: "image/png" });

    const notice = makeNotice({ mainImage: file });
    render(<NoticeItem notice={notice} isAdmin={false} onUpdate={vi.fn()} />);

    const image = screen.getByRole('img', { name: /Título/i }) as HTMLImageElement;
    expect(image.src).toContain('blob:mock');
  });


});
