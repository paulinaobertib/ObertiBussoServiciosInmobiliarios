/// <reference types="vitest" />
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// IMPORT BAJO TEST
import { CommentSection } from "../../../components/comments/CommentSection";

// Mock del formulario: muestra un botón que dispara onDone y guarda props
vi.mock("../../../components/forms/CommentForm", () => ({
  CommentForm: (props: any) => {
    return (
      <div data-testid="comment-form">
        <div data-testid="comment-form-props">{JSON.stringify({ action: props.action, item: props.item, propertyId: props.propertyId })}</div>
        <button onClick={() => props.onDone?.()} data-testid="btn-form-done">done</button>
      </div>
    );
  },
}));

// Mock de la lista: muestra dos botones para simular editar/eliminar el primer item
vi.mock("../../../components/comments/CommentList", () => ({
  CommentList: (props: any) => {
    return (
      <div data-testid="comment-list">
        <button
          data-testid="btn-edit-item"
          onClick={() => props.onEditItem?.(props.items?.[0])}
        >
          edit-item
        </button>
        <button
          data-testid="btn-delete-item"
          onClick={() => props.onDeleteItem?.(props.items?.[0])}
        >
          delete-item
        </button>
      </div>
    );
  },
}));

// Mock del servicio deleteComment
const deleteCommentMock = vi.fn().mockResolvedValue(undefined);
vi.mock("../../../services/comment.service", () => ({
  deleteComment: (...args: any[]) => deleteCommentMock(...args),
}));

describe("<CommentSection />", () => {
  const refresh = vi.fn().mockResolvedValue(undefined);
  const propertyId = 77;
  const items = [
    { id: 1, description: "primero", date: new Date().toISOString() },
    { id: 2, description: "segundo", date: new Date().toISOString() },
  ] as any[];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("render inicial: muestra 'Agregar Comentario', pasa props correctas al CommentForm y renderiza contador de lista", () => {
    render(
      <CommentSection
        propertyId={propertyId}
        loading={false}
        items={items}
        refresh={refresh}
      />
    );

    // Título inicial (modo add)
    expect(screen.getByText(/Agregar Comentario/i)).toBeInTheDocument();

    // Form recibe propertyId y action='add'
    expect(screen.getByTestId("comment-form")).toBeInTheDocument();
    const parsed = JSON.parse(
      screen.getByTestId("comment-form-props").textContent || "{}"
    );
    expect(parsed).toEqual({
      action: "add",
      item: undefined,
      propertyId,
    });

    // Contador de lista
    expect(screen.getByText(/Lista de Comentarios \(2\)/i)).toBeInTheDocument();

    // Se muestra la lista
    expect(screen.getByTestId("comment-list")).toBeInTheDocument();
  });

  it("al editar un ítem cambia a 'Editar Comentario' y el CommentForm recibe action='edit' + item; luego onDone vuelve a 'Agregar Comentario'", () => {
    render(
      <CommentSection
        propertyId={propertyId}
        loading={false}
        items={items}
        refresh={refresh}
      />
    );

    // Simular click en editar desde la lista (edita el primer item)
    fireEvent.click(screen.getByTestId("btn-edit-item"));

    // Título cambia a Editar Comentario
    expect(screen.getByText(/Editar Comentario/i)).toBeInTheDocument();

    // Form recibe action='edit' e item
    const parsedEdit = JSON.parse(
      screen.getByTestId("comment-form-props").textContent || "{}"
    );
    expect(parsedEdit.action).toBe("edit");
    expect(parsedEdit.item).toEqual(items[0]);
    expect(parsedEdit.propertyId).toBe(propertyId);

    // Disparar onDone del formulario -> vuelve a 'Agregar Comentario'
    fireEvent.click(screen.getByTestId("btn-form-done"));
    expect(screen.getByText(/Agregar Comentario/i)).toBeInTheDocument();

    // El form queda con action=add y sin item
    const parsedAfterDone = JSON.parse(
      screen.getByTestId("comment-form-props").textContent || "{}"
    );
    expect(parsedAfterDone.action).toBe("add");
    expect(parsedAfterDone.item).toBeUndefined();
  });

  it("loading=true muestra CircularProgress y no renderiza CommentList", () => {
    render(
      <CommentSection
        propertyId={propertyId}
        loading={true}
        items={items}
        refresh={refresh}
      />
    );
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    expect(screen.queryByTestId("comment-list")).toBeNull();
  });

  it("al eliminar un ítem llama deleteComment y luego refresh", async () => {
    render(
      <CommentSection
        propertyId={propertyId}
        loading={false}
        items={items}
        refresh={refresh}
      />
    );

    fireEvent.click(screen.getByTestId("btn-delete-item"));

    await waitFor(() => {
      expect(deleteCommentMock).toHaveBeenCalledWith(items[0]);
      expect(refresh).toHaveBeenCalled();
    });
  });
});
