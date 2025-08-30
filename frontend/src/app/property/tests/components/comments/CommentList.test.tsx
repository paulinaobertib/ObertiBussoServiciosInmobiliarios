/// <reference types="vitest" />
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../components/comments/CommentItem", () => ({
  CommentItem: (props: any) => (
    <div data-testid={`comment-item-${props.comment.id}`}>
      <span>{props.comment.description}</span>
      <button onClick={() => props.onEdit?.()} data-testid={`edit-${props.comment.id}`}>
        edit
      </button>
      <button onClick={() => props.onDelete?.()} data-testid={`delete-${props.comment.id}`}>
        delete
      </button>
    </div>
  ),
}));

import { CommentList } from "../../../components/comments/CommentList";

describe("<CommentList />", () => {
  const onEditItem = vi.fn();
  const onDeleteItem = vi.fn();

  const items = [
    { id: 1, description: "uno",   date: "2024-12-30T10:00:00.000Z" },
    { id: 2, description: "dos",   date: "2025-01-02T08:00:00.000Z" },
    { id: 3, description: "tres",  date: "2024-12-31T09:00:00.000Z" },
  ] as any[];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ordena por fecha DESC y renderiza un CommentItem por cada item", () => {
    render(
      <CommentList
        items={items}
        onEditItem={onEditItem}
        onDeleteItem={onDeleteItem}
      />
    );

    // Se esperan 3 items renderizados
    expect(screen.getByTestId("comment-item-1")).toBeInTheDocument();
    expect(screen.getByTestId("comment-item-2")).toBeInTheDocument();
    expect(screen.getByTestId("comment-item-3")).toBeInTheDocument();

    // Verificamos el orden de aparición en el DOM: debe ser 2 (más nuevo), 3, 1
    const renderedOrder = screen
      .getAllByTestId(/comment-item-/)
      .map((el) => el.getAttribute("data-testid"));

    expect(renderedOrder).toEqual([
      "comment-item-2",
      "comment-item-3",
      "comment-item-1",
    ]);
  });

  it("propaga correctamente onEditItem y onDeleteItem con el item correspondiente", () => {
    render(
      <CommentList
        items={items}
        onEditItem={onEditItem}
        onDeleteItem={onDeleteItem}
      />
    );

    // Click en editar del item más nuevo (id 2)
    fireEvent.click(screen.getByTestId("edit-2"));
    expect(onEditItem).toHaveBeenCalledTimes(1);
    expect(onEditItem).toHaveBeenCalledWith(
      expect.objectContaining({ id: 2, description: "dos" })
    );

    // Click en eliminar de otro item (id 1)
    fireEvent.click(screen.getByTestId("delete-1"));
    expect(onDeleteItem).toHaveBeenCalledTimes(1);
    expect(onDeleteItem).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, description: "uno" })
    );
  });
});
