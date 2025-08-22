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
    // Fijamos el "ahora" para que la lógica del chip NUEVO sea determinista
    vi.setSystemTime(new Date("2025-01-02T15:30:00Z"));
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("renderiza autor fijo, fecha/hora y la descripción; muestra chip 'Nuevo' si es reciente", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <CommentItem
        comment={{ ...baseComment, date: "2025-01-02T15:30:00Z" } as any}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    // El texto está dividido en varios nodos: verifica por partes
    expect(screen.getByText(/Creado por:/i)).toBeInTheDocument();
    expect(screen.getByText(/Usuario Administrador/i)).toBeInTheDocument();

    // Chip 'Nuevo' porque es reciente
    expect(screen.getByText(/Nuevo/i)).toBeInTheDocument();

    // Descripción (con pre-wrap)
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

    // Dos IconButtons (Editar y Eliminar). Los tomamos por orden.
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(2);

    fireEvent.click(buttons[0]); // Editar
    expect(onEdit).toHaveBeenCalledTimes(1);

    fireEvent.click(buttons[1]); // Eliminar
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
