import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TypeForm from '../../../components/forms/TypeForm';
import { describe, vi, it, expect, beforeEach } from 'vitest';
import { postType, putType, deleteType } from '../../../services/type.service';
import { usePropertyCrud } from '../../../context/PropertiesContext';
import { useGlobalAlert } from '../../../context/AlertContext';

vi.mock('../../../services/type.service');
vi.mock('../../../context/PropertiesContext');
vi.mock('../../../context/AlertContext');

describe('TypeForm', () => {
  const mockRefresh = vi.fn();
  const mockShowAlert = vi.fn();
  const mockOnDone = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (usePropertyCrud as any).mockReturnValue({
      refresh: mockRefresh,
    });
    (useGlobalAlert as any).mockReturnValue({
      showAlert: mockShowAlert,
    });
  });

  it('permite agregar un tipo de propiedad', async () => {
    render(<TypeForm action="add" onDone={mockOnDone} />);

    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Casa' } });
    fireEvent.click(screen.getByLabelText('Ambientes'));
    fireEvent.click(screen.getByLabelText('Dormitorios'));
    fireEvent.click(screen.getByLabelText('Baños'));
    fireEvent.click(screen.getByLabelText('Superficie Cubierta'));

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

    await waitFor(() => {
      expect(postType).toHaveBeenCalledWith({
        name: 'Casa',
        hasRooms: true,
        hasBedrooms: true,
        hasBathrooms: true,
        hasCoveredArea: true,
      });
      expect(mockShowAlert).toHaveBeenCalledWith(expect.any(String), 'success');
      expect(mockRefresh).toHaveBeenCalled();
      expect(mockOnDone).toHaveBeenCalled();
    });
  });

  it('permite editar un tipo de propiedad', async () => {
    const item = {
      id: 1,
      name: 'Departamento',
      hasRooms: false,
      hasBedrooms: false,
      hasBathrooms: true,
      hasCoveredArea: false,
    };

    render(<TypeForm action="edit" item={item} onDone={mockOnDone} />);

    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Depto' } });
    fireEvent.click(screen.getByLabelText('Ambientes'));

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

    await waitFor(() => {
      expect(putType).toHaveBeenCalledWith({
        ...item,
        name: 'Depto',
        hasRooms: true,
      });
      expect(mockShowAlert).toHaveBeenCalledWith(expect.any(String), 'success');
      expect(mockRefresh).toHaveBeenCalled();
      expect(mockOnDone).toHaveBeenCalled();
    });
  });

  it('permite eliminar un tipo de propiedad', async () => {
    const item = {
      id: 2,
      name: 'PH',
      hasRooms: true,
      hasBedrooms: true,
      hasBathrooms: false,
      hasCoveredArea: true,
    };

    render(<TypeForm action="delete" item={item} onDone={mockOnDone} />);

    const deleteButton = screen.getByRole('button', { name: 'Eliminar' });
    expect(deleteButton).toBeEnabled();

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(deleteType).toHaveBeenCalledWith(item);
      expect(mockShowAlert).toHaveBeenCalledWith(expect.any(String), 'success');
      expect(mockRefresh).toHaveBeenCalled();
      expect(mockOnDone).toHaveBeenCalled();
    });
  });

  it('desactiva el botón si el nombre está vacío en modo add', () => {
    render(<TypeForm action="add" onDone={mockOnDone} />);
    const button = screen.getByRole('button', { name: 'Confirmar' });
    expect(button).toBeDisabled();
  });
});
