import { render, screen, fireEvent } from '@testing-library/react';
import { FloatingButtons } from '../../../components/catalog/FloatingButtons';
import { useAuthContext } from '../../../../user/context/AuthContext';
import { vi } from 'vitest';

vi.mock('../../../../user/context/AuthContext');

describe('FloatingButtons', () => {
  const mockOnAction = vi.fn();
  const mockToggleSelectionMode = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('no renderiza nada para usuarios no administradores', () => {
    (useAuthContext as any).mockReturnValue({ isAdmin: false });

    const { container } = render(
      <FloatingButtons
        onAction={mockOnAction}
        selectionMode={false}
        toggleSelectionMode={mockToggleSelectionMode}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('muestra SpeedDial para administradores y ejecuta acciones', async () => {
    (useAuthContext as any).mockReturnValue({ isAdmin: true });

    render(
      <FloatingButtons
        onAction={mockOnAction}
        selectionMode={true}
        toggleSelectionMode={mockToggleSelectionMode}
      />
    );

    fireEvent.click(screen.getByLabelText(/Acciones de Propiedad/i));

    fireEvent.click(await screen.findByLabelText(/Agregar/i));
    fireEvent.click(await screen.findByLabelText(/Editar/i));
    fireEvent.click(await screen.findByLabelText(/Eliminar/i));

    expect(mockOnAction).toHaveBeenNthCalledWith(1, 'create');
    expect(mockOnAction).toHaveBeenNthCalledWith(2, 'edit');
    expect(mockOnAction).toHaveBeenNthCalledWith(3, 'delete');
    expect(mockToggleSelectionMode).toHaveBeenCalled();
  });
});
