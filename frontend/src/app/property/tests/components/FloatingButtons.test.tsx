import { render, screen, fireEvent } from '@testing-library/react';
import FloatingButtons from '../../components/FloatingButtons';
import { describe, it, vi, expect, beforeEach } from 'vitest';

describe('FloatingButtons', () => {
  const onAction = vi.fn();
  const onCompare = vi.fn();
  const toggleSelectionMode = vi.fn();

  const renderComponent = (compareCount = 0, selectionMode = false) => {
    render(
      <FloatingButtons
        onAction={onAction}
        onCompare={onCompare}
        toggleSelectionMode={toggleSelectionMode}
        compareCount={compareCount}
        selectionMode={selectionMode}
      />
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deshabilita el botón de comparar si hay menos de 2 propiedades', () => {
    renderComponent(1);
    const compareBtn = screen.getByRole('button', { name: /comparar propiedades/i });
    expect(compareBtn).toBeDisabled();
  });

  it('habilita el botón de comparar si hay 2 o 3 propiedades', () => {
    renderComponent(2);
    const compareBtn = screen.getByRole('button', { name: /comparar propiedades/i });
    expect(compareBtn).not.toBeDisabled();
  });

  it('dispara onCompare al hacer click en el botón de comparar', () => {
    renderComponent(2);
    const compareBtn = screen.getByRole('button', { name: /comparar propiedades/i });
    fireEvent.click(compareBtn);
    expect(onCompare).toHaveBeenCalled();
  });

  it('dispara onAction con "create" al hacer click en la acción Agregar', async () => {
    renderComponent();

    const speedDialButton = screen.getByLabelText('Acciones de Propiedad');
    fireEvent.click(speedDialButton);

    const addButton = screen.getByLabelText(/agregar/i);
    fireEvent.click(addButton);

    expect(onAction).toHaveBeenCalledWith('create');
  });

  it('dispara toggleSelectionMode al hacer click en el botón de seleccionar', () => {
    renderComponent();
    const selectBtn = screen.getByRole('button', { name: /seleccionar/i });
    fireEvent.click(selectBtn);
    expect(toggleSelectionMode).toHaveBeenCalled();
  });

  it('muestra "Cancelar selección" si selectionMode es true', () => {
    renderComponent(0, true);
    expect(
      screen.getByRole('button', { name: /cancelar selección/i })
    ).toBeInTheDocument();
  });
});
