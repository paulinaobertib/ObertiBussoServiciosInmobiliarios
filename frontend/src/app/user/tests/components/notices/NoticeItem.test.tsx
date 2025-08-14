/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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
let lastOnValidityChange: ((v: boolean) => void) | null = null;

vi.mock("../../../components/notices/NoticeForm", () => {
  const React = require("react");
  const NoticeForm = React.forwardRef((props: any, ref: any) => {
    const { onValidityChange } = props;
    lastOnValidityChange = onValidityChange;
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

// ---------- helpers ----------
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
    // restablecemos valores de form
    updateDataReturn = {
      title: "Editado",
      description: "nuevo desc",
      mainImage: null,
      date: "2025-06-11T10:00:00Z",
    };
    lastOnValidityChange = null;
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

  it("si NO es reciente, no muestra chip NUEVO ni fecha", () => {
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
    expect(screen.queryByText(day)).toBeNull();
  });

  it("navega al detalle al clickear la card y al clickear 'Leer más'", () => {
    const notice = makeNotice({ id: 101 });
    render(
      <NoticeItem notice={notice} isAdmin={false} onUpdate={vi.fn()} />
    );

    // click en la card (cualquier lugar fuera de botones)
    // tomamos el botón 'Leer más' para no confundir con icon buttons
    fireEvent.click(screen.getByRole("button", { name: /Leer más/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/news/101");

    // hacer click sobre el contenedor principal también dispara navegación
    // (tomamos el título como target de click)
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

    // Heurística: los IconButton no tienen texto visible; filtramos los buttons que contienen un <svg>
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

});
