import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

vi.mock('@mui/material/styles', () => ({}));

vi.mock('@mui/lab', () => ({
  LoadingButton: (props: any) => (
    <button
      type="button"
      onClick={props.onClick}
      data-variant={props.variant}
      data-color={props.color}
    >
      {props.children}
    </button>
  ),
}));

const postCommentMock = vi.fn(async (x) => ({ ok: true, data: x }));
const putCommentMock = vi.fn(async (x) => ({ ok: true, data: x }));
const deleteCommentMock = vi.fn(async (x) => ({ ok: true, data: x }));
vi.mock('../../../services/comment.service', () => ({
  postComment: (x: any) => postCommentMock(x),
  putComment:  (x: any) => putCommentMock(x),
  deleteComment: (x: any) => deleteCommentMock(x),
}));

let authInfo: any = { id: 'user-1', name: 'Tester' };
vi.mock('../../../../user/context/AuthContext', () => ({
  useAuthContext: () => ({ info: authInfo }),
}));

type UseCategoriesOptions<T> = {
  initial: T;
  action: 'add' | 'edit' | 'delete';
  save: (payload: T) => Promise<any>;
  refresh: () => Promise<void>;
  onDone: () => void;
};

let lastCategoriesOpts: UseCategoriesOptions<any> | null = null;
let formState: any = null;
let loadingState = false;
let setFormMock = vi.fn((next: any) => { formState = next; });
let refreshSpy = vi.fn(async () => {});
let onDoneSpy = vi.fn(() => {});

const deepClone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

vi.mock('../../../hooks/useCategories', () => ({
  useCategories: <T,>(opts: UseCategoriesOptions<T>) => {
    lastCategoriesOpts = opts;
    formState = deepClone(opts.initial);
    loadingState = false;

    const run = async () => {
      loadingState = true;
      await opts.save(formState);
      await opts.refresh();
      opts.onDone();
      loadingState = false;
    };

    return {
      form: formState,
      setForm: setFormMock,
      run,
      loading: loadingState,
    };
  },
}));

import { CommentForm } from '../../../components/forms/CommentForm';

beforeEach(() => {
  authInfo = { id: 'user-1', name: 'Tester' };
  lastCategoriesOpts = null;
  formState = null;
  loadingState = false;
  setFormMock = vi.fn((next: any) => { formState = next; });
  refreshSpy = vi.fn(async () => {});
  onDoneSpy = vi.fn(() => {});
  postCommentMock.mockClear();
  putCommentMock.mockClear();
  deleteCommentMock.mockClear();
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('CommentForm', () => {
  it('ADD: siembra initialPayload con userId del auth y muestra botones', () => {
    render(
      <CommentForm
        propertyId={99}
        action="add"
        refresh={refreshSpy}
        onDone={onDoneSpy}
      />
    );

    const text = screen.getByLabelText('Descripción') as HTMLTextAreaElement;
    expect(text).toBeInTheDocument();
    expect(text).not.toBeDisabled();
    expect(text.value).toBe('');

    // Botón Cancelar visible en add
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    // Botón Confirmar visible
    expect(screen.getByRole('button', { name: 'Confirmar' })).toBeInTheDocument();

    // El mock de useCategories recibió initial con userId del auth
    expect(lastCategoriesOpts?.initial).toMatchObject({
      id: 0,
      propertyId: 99,
      description: '',
      date: '',
      userId: 'user-1',
    });
  });

  it('ADD: escribir descripción y submit → postComment; luego refresh + onDone; resetea form', async () => {
    render(
      <CommentForm
        propertyId={5}
        action="add"
        refresh={refreshSpy}
        onDone={onDoneSpy}
      />
    );

    const text = screen.getByLabelText('Descripción') as HTMLTextAreaElement;
    fireEvent.change(text, { target: { value: 'Nuevo comentario' } });
    expect(setFormMock).toHaveBeenCalled();

    const confirmBtn = screen.getByRole('button', { name: 'Confirmar' });
    fireEvent.click(confirmBtn);

    await waitFor(() => expect(postCommentMock).toHaveBeenCalledTimes(1));
    const sent = postCommentMock.mock.calls[0][0];
    expect(sent).toMatchObject({
      id: 0,
      propertyId: 5,
      description: 'Nuevo comentario',
      date: '',
      userId: 'user-1',
    });

    await waitFor(() => expect(refreshSpy).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(onDoneSpy).toHaveBeenCalledTimes(1));

    // Reseteo al initialPayload
    expect(setFormMock).toHaveBeenLastCalledWith({
      id: 0,
      propertyId: 5,
      description: '',
      date: '',
      userId: 'user-1',
    });
  });

  it('ADD: Cancelar resetea el form y llama onDone', async () => {
    render(
      <CommentForm
        propertyId={7}
        action="add"
        refresh={refreshSpy}
        onDone={onDoneSpy}
      />
    );

    const text = screen.getByLabelText('Descripción') as HTMLTextAreaElement;
    fireEvent.change(text, { target: { value: 'Escribiendo…' } });

    const cancelBtn = screen.getByRole('button', { name: 'Cancelar' });
    fireEvent.click(cancelBtn);

    await waitFor(() => expect(onDoneSpy).toHaveBeenCalledTimes(1));
    expect(setFormMock).toHaveBeenLastCalledWith({
      id: 0,
      propertyId: 7,
      description: '',
      date: '',
      userId: 'user-1',
    });
  });

  it('EDIT: siembra el form con el item; Confirmar → putComment; luego refresh + onDone; resetea form', async () => {
    const item = {
      id: 42,
      propertyId: 11,
      description: 'Texto existente',
      date: '2025-09-10',
      userId: 'u-xyz',
    };

    render(
      <CommentForm
        propertyId={11}
        action="edit"
        item={item as any}
        refresh={refreshSpy}
        onDone={onDoneSpy}
      />
    );

    // El effect setea el form con el item
    expect(setFormMock).toHaveBeenCalledWith(item);

    const text = screen.getByLabelText('Descripción') as HTMLTextAreaElement;
    expect(text).not.toBeDisabled();
    expect(text.value).toBe('Texto existente');

    const confirmBtn = screen.getByRole('button', { name: 'Confirmar' });
    fireEvent.click(confirmBtn);

    await waitFor(() => expect(putCommentMock).toHaveBeenCalledTimes(1));
    expect(putCommentMock.mock.calls[0][0]).toMatchObject(item);

    await waitFor(() => expect(refreshSpy).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(onDoneSpy).toHaveBeenCalledTimes(1));

    // Reseteo al initialPayload (que es el item en edit)
    expect(setFormMock).toHaveBeenLastCalledWith({
      id: 42,
      propertyId: 11,
      description: 'Texto existente',
      date: '2025-09-10',
      userId: 'u-xyz',
    });
  });

  it('DELETE: textarea deshabilitado; solo "Eliminar"; submit → deleteComment; luego refresh + onDone; resetea form', async () => {
    const item = {
      id: 9,
      propertyId: 3,
      description: '',
      date: '2025-01-01',
      userId: 'u-del',
    };

    render(
      <CommentForm
        propertyId={3}
        action="delete"
        item={item as any}
        refresh={refreshSpy}
        onDone={onDoneSpy}
      />
    );

    const text = screen.getByLabelText('Descripción') as HTMLTextAreaElement;
    expect(text).toBeDisabled();

    // No hay "Cancelar"
    expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument();

    // Botón principal dice "Eliminar"
    const deleteBtn = screen.getByRole('button', { name: 'Eliminar' });
    fireEvent.click(deleteBtn);

    await waitFor(() => expect(deleteCommentMock).toHaveBeenCalledTimes(1));
    expect(deleteCommentMock.mock.calls[0][0]).toMatchObject(item);

    await waitFor(() => expect(refreshSpy).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(onDoneSpy).toHaveBeenCalledTimes(1));

    // Reseteo al initialPayload (igual al item en delete)
    expect(setFormMock).toHaveBeenLastCalledWith({
      id: 9,
      propertyId: 3,
      description: '',
      date: '2025-01-01',
      userId: 'u-del',
    });
  });
});
