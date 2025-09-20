import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

vi.mock('@mui/material/styles', () => ({}));

import { CommentItem } from '../../../components/comments/CommentItem';
import type { Comment } from '../../../types/comment';

const FIXED_NOW = new Date('2025-09-18T12:00:00Z'); // fijo para tests

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FIXED_NOW);
});

afterEach(() => {
  vi.useRealTimers();
  cleanup();
  vi.clearAllMocks();
});

const makeComment = (overrides: Partial<Comment> = {}): Comment => ({
  id: 1,
  propertyId: 1,
  description: 'Texto del comentario\ncon salto de línea',
  date: new Date('2025-09-17T08:30:00Z').toISOString(), // por defecto: < 3 días
  userId: 'user-xyz',
  ...overrides,
});

describe('CommentItem', () => {
  it('muestra authorName cuando se provee; si no, cae a userId', () => {
    // Con authorName
    const c1 = makeComment();
    const { rerender } = render(
      <CommentItem
        comment={c1}
        authorName="Juan Pérez"
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );
    expect(screen.getByText(/Creado por:/)).toBeInTheDocument();
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();

    // Sin authorName -> usa userId
    const c2 = makeComment({ userId: 'u-123' });
    rerender(
      <CommentItem
        comment={c2}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );
    expect(screen.getByText('u-123')).toBeInTheDocument();
  });

  it('muestra la descripción (con preservación de saltos de línea)', () => {
    const comment = makeComment({
      description: 'Línea 1\nLínea 2',
    });
    render(
      <CommentItem
        comment={comment}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );
    // Se renderiza como texto plano (whiteSpace: 'pre-wrap' en el componente)
    expect(screen.getByText(/Línea 1/)).toBeInTheDocument();
    expect(screen.getByText(/Línea 2/)).toBeInTheDocument();
  });

  it('formatea fecha y hora usando toLocaleDateString/toLocaleTimeString', () => {
    const comment = makeComment({ date: '2025-09-15T14:05:00Z' });
    const spyDate = vi
      .spyOn(Date.prototype as any, 'toLocaleDateString')
      .mockReturnValue('15 sept 2025');
    const spyTime = vi
      .spyOn(Date.prototype as any, 'toLocaleTimeString')
      .mockReturnValue('14:05');

    render(
      <CommentItem
        comment={comment}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );

    // Se esperan ambos fragmentos en pantalla
    expect(screen.getByText(/15 sept 2025/)).toBeInTheDocument();
    expect(screen.getByText(/14:05/)).toBeInTheDocument();

    spyDate.mockRestore();
    spyTime.mockRestore();
  });

  it('muestra el Chip "Nuevo" si el comentario es de menos de 3 días', () => {
    // now = 2025-09-18; comentario del 17/09 -> < 3 días => "Nuevo"
    const comment = makeComment({ date: '2025-09-17T10:00:00Z' });
    render(
      <CommentItem
        comment={comment}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );
    expect(screen.getByText('Nuevo')).toBeInTheDocument();
  });

  it('NO muestra el Chip "Nuevo" si el comentario es de 3 días o más', () => {
    // Comentario del 2025-09-14 -> 4 días antes
    const comment = makeComment({ date: '2025-09-14T12:00:00Z' });
    render(
      <CommentItem
        comment={comment}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );
    expect(screen.queryByText('Nuevo')).not.toBeInTheDocument();
  });

  it('click en Editar y Eliminar llama a sus handlers', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const comment = makeComment();

    const { container } = render(
      <CommentItem
        comment={comment}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    const allButtons = container.querySelectorAll('button');
    expect(allButtons.length).toBeGreaterThanOrEqual(2);

    const editBtn = allButtons[0];
    const deleteBtn = allButtons[1];

    fireEvent.click(editBtn);
    fireEvent.click(deleteBtn);

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
