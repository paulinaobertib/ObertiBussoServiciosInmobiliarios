import { describe, it, expect, vi, beforeEach, afterEach, Mock } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { usePropertyNotes } from "../../../hooks/usePropertyNotes";

vi.mock("@mui/material/styles", () => ({}));

const lastFormProps: any[] = [];
const lastListProps: any[] = [];

vi.mock("../../../hooks/usePropertyNotes", () => ({
  usePropertyNotes: vi.fn(() => ({
    removeComment: vi.fn(async () => true), // simula eliminación exitosa
  })),
}));

vi.mock("../../../components/forms/CommentForm", () => ({
  CommentForm: (props: any) => {
    lastFormProps.push(props);
    // Exponemos botones utilitarios para disparar onDone desde el test
    return (
      <div data-testid="comment-form" data-action={props.action} data-item-id={props.item?.id ?? ""}>
        <button onClick={() => props.onDone?.()} data-testid="form-done">
          form-done
        </button>
      </div>
    );
  },
}));

vi.mock("../../../components/comments/CommentList", () => ({
  CommentList: (props: any) => {
    lastListProps.push(props);
    // Renderizamos botones para simular editar/eliminar el primer item
    const first = props.items?.[0];
    return (
      <div data-testid="comment-list">
        <button onClick={() => props.onEditItem?.(first)} data-testid="list-edit-first" disabled={!first}>
          edit-first
        </button>
        <button onClick={() => props.onDeleteItem?.(first)} data-testid="list-delete-first" disabled={!first}>
          delete-first
        </button>
      </div>
    );
  },
}));

/** Servicio deleteComment */
const deleteCommentMock = vi.fn(async (x) => ({ ok: true, data: x }));
vi.mock("../../../services/comment.service", () => ({
  deleteComment: (x: any) => deleteCommentMock(x),
}));

/** SUT */
import { CommentSection } from "../../../components/comments/CommentSection";
import type { Comment } from "../../../types/comment";

beforeEach(() => {
  lastFormProps.length = 0;
  lastListProps.length = 0;
  deleteCommentMock.mockClear();
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const make = (over: Partial<Comment>): Comment => ({
  id: 1,
  propertyId: 10,
  description: "desc",
  date: "2025-09-15T10:00:00Z",
  userId: "u1",
  ...over,
});

describe("CommentSection", () => {
  it('render inicial: muestra "Agregar Comentario", pasa props a CommentForm y renderiza lista', () => {
    const items = [make({ id: 1 }), make({ id: 2 })];
    const refresh = vi.fn(async () => {});
    const getUserName = vi.fn((id: string) => `Name(${id})`);

    render(
      <CommentSection propertyId={999} loading={false} items={items} refresh={refresh} getUserName={getUserName} />
    );

    // Título del formulario en modo add
    expect(screen.getByText("Agregar Comentario")).toBeInTheDocument();

    // El CommentForm se renderiza con action=add, item undefined y propertyId correcto
    expect(screen.getByTestId("comment-form")).toBeInTheDocument();
    const lastForm = lastFormProps.at(-1);
    expect(lastForm.action).toBe("add");
    expect(lastForm.item).toBeUndefined();
    expect(lastForm.propertyId).toBe(999);
    expect(lastForm.refresh).toBe(refresh);

    // Encabezado de lista
    expect(screen.getByText("Lista de Comentarios")).toBeInTheDocument();

    // CommentList visible
    expect(screen.getByTestId("comment-list")).toBeInTheDocument();
    const lastList = lastListProps.at(-1);
    expect(Array.isArray(lastList.items)).toBe(true);
    expect(lastList.items).toHaveLength(2);
    expect(lastList.getUserName).toBe(getUserName);
  });

  it("onDeleteItem llama removeComment del hook y luego refresh", async () => {
    const items = [make({ id: 7 })];
    const refresh = vi.fn(async () => {});
    const removeComment = vi.fn(async () => true);

    // Sobrescribimos la implementación del mock para este test
    (usePropertyNotes as Mock).mockReturnValue({ removeComment });

    render(<CommentSection propertyId={1} loading={false} items={items} refresh={refresh} getUserName={(id) => id} />);

    fireEvent.click(screen.getByTestId("list-delete-first"));

    // Esperamos a que se haya invocado removeComment
    await waitFor(() => expect(removeComment).toHaveBeenCalledWith(items[0]));

    // Y que luego se haya invocado refresh
    await waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));
  });

  it('al editar desde la lista cambia a "Editar Comentario" y el CommentForm recibe action="edit" e item', () => {
    const items = [make({ id: 10, description: "A" }), make({ id: 20, description: "B" })];
    const refresh = vi.fn(async () => {});

    render(<CommentSection propertyId={5} loading={false} items={items} refresh={refresh} getUserName={(id) => id} />);

    // Disparamos edición del primero desde la lista
    fireEvent.click(screen.getByTestId("list-edit-first"));

    // Cambia título
    expect(screen.getByText("Editar Comentario")).toBeInTheDocument();

    // El último render del CommentForm debe tener action=edit y item=items[0]
    const lastForm = lastFormProps.at(-1);
    expect(lastForm.action).toBe("edit");
    expect(lastForm.item.id).toBe(10);
  });

  it("onDone del CommentForm vuelve a modo add y limpia selección", () => {
    const items = [make({ id: 10 })];
    const refresh = vi.fn(async () => {});

    render(<CommentSection propertyId={1} loading={false} items={items} refresh={refresh} getUserName={(id) => id} />);

    // Pasamos a editar
    fireEvent.click(screen.getByTestId("list-edit-first"));
    expect(screen.getByText("Editar Comentario")).toBeInTheDocument();

    // Disparamos onDone (desde el mock del form)
    fireEvent.click(screen.getByTestId("form-done"));

    // Debe volver a "Agregar Comentario"
    expect(screen.getByText("Agregar Comentario")).toBeInTheDocument();

    // Ultimas props del form: action=add, item undefined
    const lastForm = lastFormProps.at(-1);
    expect(lastForm.action).toBe("add");
    expect(lastForm.item).toBeUndefined();
  });

  it("loading=true muestra spinner y no renderiza CommentList", () => {
    const items = [make({ id: 1 })];

    render(
      <CommentSection
        propertyId={1}
        loading={true}
        items={items}
        refresh={vi.fn(async () => {})}
        getUserName={(id) => id}
      />
    );

    // Spinner
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    // No hay lista
    expect(screen.queryByTestId("comment-list")).not.toBeInTheDocument();
  });
});
