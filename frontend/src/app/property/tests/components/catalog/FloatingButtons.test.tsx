import { render, screen, fireEvent } from '@testing-library/react';
import { FloatingButtons } from '../../../components/catalog/FloatingButtons';
import { useAuthContext } from '../../../../user/context/AuthContext';
import { usePropertiesContext } from '../../../context/PropertiesContext';
import { vi } from 'vitest';

vi.mock('../../../../user/context/AuthContext');
vi.mock('../../../context/PropertiesContext');

describe('FloatingButtons', () => {
  const mockOnAction = vi.fn();
  const mockToggleSelectionMode = vi.fn();
  const mockOnCompare = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (usePropertiesContext as any).mockReturnValue({ disabledCompare: false });
  });

  it('muestra botones de usuario si no es admin', () => {
    (useAuthContext as any).mockReturnValue({ isAdmin: false });

    render(
      <FloatingButtons
        onAction={mockOnAction}
        selectionMode={false}
        toggleSelectionMode={mockToggleSelectionMode}
        onCompare={mockOnCompare}
      />
    );

    expect(screen.getByAltText('Comparer')).toBeInTheDocument();
    expect(screen.getByAltText('Select')).toBeInTheDocument();
    expect(screen.queryByLabelText(/Acciones de Propiedad/i)).not.toBeInTheDocument();
  });

  it('llama a onCompare al clickear el botón comparar', () => {
    (useAuthContext as any).mockReturnValue({ isAdmin: false });

    render(
      <FloatingButtons
        onAction={mockOnAction}
        selectionMode={false}
        toggleSelectionMode={mockToggleSelectionMode}
        onCompare={mockOnCompare}
      />
    );

    fireEvent.click(screen.getByAltText('Comparer'));
    expect(mockOnCompare).toHaveBeenCalled();
  });

  it('llama a toggleSelectionMode al clickear el botón seleccionar', () => {
    (useAuthContext as any).mockReturnValue({ isAdmin: false });

    render(
      <FloatingButtons
        onAction={mockOnAction}
        selectionMode={false}
        toggleSelectionMode={mockToggleSelectionMode}
        onCompare={mockOnCompare}
      />
    );

    fireEvent.click(screen.getByAltText('Select'));
    expect(mockToggleSelectionMode).toHaveBeenCalled();
  });

  it('muestra SpeedDial y llama onAction para admin', async () => {
    (useAuthContext as any).mockReturnValue({ isAdmin: true });

    render(
      <FloatingButtons
        onAction={mockOnAction}
        selectionMode={true}
        toggleSelectionMode={mockToggleSelectionMode}
        onCompare={mockOnCompare}
      />
    );

    // Abrir el SpeedDial
    const settingsButton = screen.getByLabelText(/Acciones de Propiedad/i);
    fireEvent.click(settingsButton);

    // Los actions se identifican por aria-label (no por title)
    const addButton = await screen.findByLabelText(/Agregar/i);
    const editButton = await screen.findByLabelText(/Editar/i);
    const deleteButton = await screen.findByLabelText(/Eliminar/i);

    fireEvent.click(addButton);
    expect(mockOnAction).toHaveBeenCalledWith('create');

    fireEvent.click(editButton);
    expect(mockOnAction).toHaveBeenCalledWith('edit');

    fireEvent.click(deleteButton);
    expect(mockOnAction).toHaveBeenCalledWith('delete');
  });

  it('cierra SpeedDial y llama toggleSelectionMode si estaba activo', async () => {
    (useAuthContext as any).mockReturnValue({ isAdmin: true });

    render(
      <FloatingButtons
        onAction={mockOnAction}
        selectionMode={true}
        toggleSelectionMode={mockToggleSelectionMode}
        onCompare={mockOnCompare}
      />
    );

    const settingsButton = screen.getByLabelText(/Acciones de Propiedad/i);
    fireEvent.click(settingsButton);

    const addButton = await screen.findByLabelText(/Agregar/i);
    fireEvent.click(addButton);

    expect(mockToggleSelectionMode).toHaveBeenCalled();
  });

});
