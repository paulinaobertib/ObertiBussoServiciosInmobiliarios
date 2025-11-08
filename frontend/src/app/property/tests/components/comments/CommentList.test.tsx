/* src/app/property/tests/components/comments/CommentList.test.tsx */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import "@testing-library/jest-dom";

/** Evitar warnings/errores por estilos MUI en tests */
vi.mock("@mui/material/styles", () => ({}));

/**
 * Mock de CommentItem:
 *  - muestra un div simple con data para aserciones
 *  - expone botones "Editar" y "Eliminar" que disparan las props recibidas
 *  - así aislamos CommentList y verificamos que pasa bien las props
 */
const commentItemMock = vi.fn();
vi.mock("../../../components/comments/CommentItem", () => ({
  CommentItem: (props: any) => {
    commentItemMock(props);
    return (
      <div data-testid="comment-item" data-id={props.comment.id}>
        <div data-testid="author">{props.authorName}</div>
        <button onClick={props.onEdit}>Editar</button>
        <button onClick={props.onDelete}>Eliminar</button>
      </div>
    );
  },
}));

/** SUT */
import { CommentList } from "../../../components/comments/CommentList";
import type { Comment } from "../../../types/comment";

beforeEach(() => {
  vi.useFakeTimers();
  commentItemMock.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
  cleanup();
  vi.clearAllMocks();
});

const make = (over: Partial<Comment>): Comment => ({
  id: 1,
  propertyId: 1,
  description: "desc",
  date: new Date("2025-09-16T10:00:00Z").toISOString(),
  userId: "u1",
  ...over,
});

describe("CommentList", () => {
  it("ordena por fecha (más reciente primero) y pasa authorName desde getUserName(userId)", () => {
    const items: Comment[] = [
      make({ id: 1, userId: "u1", date: "2025-09-10T09:00:00Z", description: "A" }),
      make({ id: 2, userId: "u2", date: "2025-09-12T12:00:00Z", description: "B" }),
      make({ id: 3, userId: "u3", date: "2025-09-18T08:00:00Z", description: "C" }), // más reciente
      make({ id: 4, userId: "u4", date: "2025-09-15T18:30:00Z", description: "D" }),
    ];

    const onEditItem = vi.fn();
    const onDeleteItem = vi.fn();
    const getUserName = vi.fn((id: string) => `Name(${id})`);

    // ⬇️ no necesitamos `container`
    render(<CommentList items={items} onEditItem={onEditItem} onDeleteItem={onDeleteItem} getUserName={getUserName} />);

    // Se deben haber renderizado 4 CommentItem (mockeados)
    const cards = screen.getAllByTestId("comment-item");
    expect(cards).toHaveLength(4);

    // Orden esperado: id 3 (18 Sep), id 4 (15 Sep), id 2 (12 Sep), id 1 (10 Sep)
    const idsInDom = cards.map((el) => Number(el.getAttribute("data-id")));
    expect(idsInDom).toEqual([3, 4, 2, 1]);

    // Se llamó getUserName para cada userId
    expect(getUserName).toHaveBeenCalledTimes(4);
    expect(getUserName).toHaveBeenNthCalledWith(1, "u3"); // el primero renderizado (más reciente)
    expect(getUserName).toHaveBeenNthCalledWith(2, "u4");
    expect(getUserName).toHaveBeenNthCalledWith(3, "u2");
    expect(getUserName).toHaveBeenNthCalledWith(4, "u1");

    // Además, el mock de CommentItem recibió authorName correcto
    const firstCallProps = commentItemMock.mock.calls[0][0];
    expect(firstCallProps.comment.id).toBe(3);
    expect(firstCallProps.authorName).toBe("Name(u3)");
  });

  it("clic en Editar/Eliminar dispara onEditItem/onDeleteItem con el item correcto", () => {
    const items: Comment[] = [
      make({ id: 10, userId: "u10", date: "2025-09-13T06:00:00Z", description: "A" }),
      make({ id: 20, userId: "u20", date: "2025-09-19T06:00:00Z", description: "B" }), // más reciente (primero)
    ];

    const onEditItem = vi.fn();
    const onDeleteItem = vi.fn();
    const getUserName = vi.fn((id: string) => `Name(${id})`);

    render(<CommentList items={items} onEditItem={onEditItem} onDeleteItem={onDeleteItem} getUserName={getUserName} />);

    // En DOM el primer comment es el id=20 (más reciente)
    const allCards = screen.getAllByTestId("comment-item");
    const first = allCards[0];
    const second = allCards[1];

    // Click en Editar del primero → onEditItem recibe el item id=20
    fireEvent.click(within(first).getByText("Editar"));
    expect(onEditItem).toHaveBeenCalledTimes(1);
    expect(onEditItem.mock.calls[0][0].id).toBe(20);

    // Click en Eliminar del segundo → onDeleteItem recibe el item id=10
    fireEvent.click(within(second).getByText("Eliminar"));
    expect(onDeleteItem).toHaveBeenCalledTimes(1);
    expect(onDeleteItem.mock.calls[0][0].id).toBe(10);
  });

  it("con lista vacía no renderiza CommentItem", () => {
    const onEditItem = vi.fn();
    const onDeleteItem = vi.fn();
    const getUserName = vi.fn();

    render(<CommentList items={[]} onEditItem={onEditItem} onDeleteItem={onDeleteItem} getUserName={getUserName} />);

    expect(screen.queryAllByTestId("comment-item")).toHaveLength(0);
    expect(commentItemMock).not.toHaveBeenCalled();
  });
});
