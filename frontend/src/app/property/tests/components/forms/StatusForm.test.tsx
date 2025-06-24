import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StatusForm from '../../../components/forms/StatusForm';
import { describe, it, vi, beforeEach, expect } from 'vitest';
import { putPropertyStatus } from '../../../services/property.service';
import { usePropertyCrud } from '../../../context/PropertiesContext';
import { useGlobalAlert } from '../../../context/AlertContext';

vi.mock('../../../services/property.service');
vi.mock('../../../context/PropertiesContext');
vi.mock('../../../context/AlertContext');

describe('StatusForm', () => {
  const mockLoadProperty = vi.fn();
  const mockShowAlert = vi.fn();
  const mockOnDone = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (usePropertyCrud as any).mockReturnValue({
      loadProperty: mockLoadProperty,
    });
    (useGlobalAlert as any).mockReturnValue({
      showAlert: mockShowAlert,
    });
  });

  const item = { id: 1, status: 'DISPONIBLE' };

  it('muestra el estado actual y permite cambiarlo', () => {
    render(<StatusForm item={item} onDone={mockOnDone} />);
    expect(screen.getByText('DISPONIBLE')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeDisabled();

    fireEvent.mouseDown(screen.getByLabelText('Estado')); // abre el menú
    fireEvent.click(screen.getByText('RESERVADA'));

    expect(screen.getByRole('button', { name: 'Guardar' })).toBeEnabled();
  });

  it('guarda los cambios correctamente', async () => {
    render(<StatusForm item={item} onDone={mockOnDone} />);

    fireEvent.mouseDown(screen.getByLabelText('Estado'));
    fireEvent.click(screen.getByText('RESERVADA'));

    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() => {
      expect(putPropertyStatus).toHaveBeenCalledWith(1, 'RESERVADA');
      expect(mockShowAlert).toHaveBeenCalledWith(expect.any(String), 'success');
      expect(mockLoadProperty).toHaveBeenCalledWith(1);
      expect(mockOnDone).toHaveBeenCalled();
    });
  });

  it('muestra error si la actualización falla', async () => {
    (putPropertyStatus as any).mockRejectedValueOnce(new Error('fail'));

    render(<StatusForm item={item} onDone={mockOnDone} />);

    fireEvent.mouseDown(screen.getByLabelText('Estado'));
    fireEvent.click(screen.getByText('VENDIDA'));

    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() => {
      expect(mockShowAlert).toHaveBeenCalledWith(expect.any(String), 'error');
    });
  });
});
