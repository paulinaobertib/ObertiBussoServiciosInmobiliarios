/// <reference types="vitest" />
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CommentItem } from "../../../components/comments/CommentItem";

describe("<CommentItem />", () => {
  const baseComment = {
    id: 1,
    description: "Texto del comentario\ncon salto de línea",
    date: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-02T15:30:00Z"));
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("renderiza autor, fecha/hora y la descripción; muestra chip 'Nuevo' si es reciente", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <CommentItem
        comment={{ ...baseComment, date: "2025-01-02T15:30:00Z" } as any}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText(/Creado por:/i)).toBeInTheDocument();
    expect(screen.getByText(/Usuario Administrador/i)).toBeInTheDocument();
    expect(screen.getByText(/Nuevo/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Texto del comentario\s*con salto de línea/i)
    ).toBeInTheDocument();
  });

  it("no muestra chip 'Nuevo' si la fecha es anterior a 3 días", () => {
    const oldDate = new Date("2024-12-28T10:00:00Z").toISOString();

    render(
      <CommentItem
        comment={{ ...baseComment, date: oldDate } as any}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );

    expect(screen.queryByText(/Nuevo/i)).toBeNull();
  });

  it("dispara onEdit y onDelete al clickear los icon buttons", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <CommentItem
        comment={{ ...baseComment, date: "2025-01-02T15:30:00Z" } as any}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(2);

    fireEvent.click(buttons[0]);
    expect(onEdit).toHaveBeenCalledTimes(1);

    fireEvent.click(buttons[1]);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
  
  it("renderiza el Card con el padding correcto", () => {
    render(<CommentItem comment={baseComment as any} onEdit={() => {}} onDelete={() => {}} />);
    const card = screen.getByText(/Creado por:/i).closest('div'); // el Card envuelve el Box
    expect(card).toBeInTheDocument();
  });

  it("renderiza Divider correctamente", () => {
    render(<CommentItem comment={baseComment as any} onEdit={() => {}} onDelete={() => {}} />);
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it("Tooltip de los icon buttons contiene los textos correctos", () => {
    render(<CommentItem comment={baseComment as any} onEdit={() => {}} onDelete={() => {}} />);
    expect(screen.getByLabelText(/Editar/i) || screen.getByTitle(/Editar/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Eliminar/i) || screen.getByTitle(/Eliminar/i)).toBeInTheDocument();
  });

  it("Typography de descripción mantiene white-space pre-wrap", () => {
    render(<CommentItem comment={baseComment as any} onEdit={() => {}} onDelete={() => {}} />);
    const desc = screen.getByText(/Texto del comentario/i);
    expect(desc).toHaveStyle({ whiteSpace: 'pre-wrap' });
  });

});
