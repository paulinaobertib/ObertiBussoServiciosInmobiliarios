import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OwnerForm from '../../../components/categories/OwnerForm';
import * as ownerService from '../../../services/owner.service';
import * as PropertiesContext from '../../../context/PropertiesContext';
import * as AlertContext from '../../../../shared/context/AlertContext';

describe('OwnerForm', () => {
  const mockRefresh = vi.fn();
  const mockShowAlert = vi.fn();
  const mockOnDone = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(PropertiesContext, 'usePropertyCrud').mockReturnValue({
      refresh: mockRefresh,
    } as any);

    vi.spyOn(AlertContext, 'useGlobalAlert').mockReturnValue({
      showAlert: mockShowAlert,
    });
  });

  it('renderiza campos deshabilitados en delete', () => {
    const item = { id: 1, firstName: 'Juan', lastName: 'Perez', mail: 'juan@mail.com', phone: '123456789' };
    render(<OwnerForm action="delete" item={item} onDone={mockOnDone} />);

    expect(screen.getByLabelText(/nombre/i)).toBeDisabled();
    expect(screen.getByLabelText(/apellido/i)).toBeDisabled();
    expect(screen.getByLabelText(/mail/i)).toBeDisabled();
    expect(screen.getByLabelText(/teléfono/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /eliminar/i })).toBeEnabled();
  });

  it('valida que campos estén completos para habilitar botón en add', () => {
    render(<OwnerForm action="add" onDone={mockOnDone} />);

    expect(screen.getByRole('button', { name: /confirmar/i })).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Juan' } });
    fireEvent.change(screen.getByLabelText(/apellido/i), { target: { value: 'Perez' } });
    fireEvent.change(screen.getByLabelText(/mail/i), { target: { value: 'juan@mail.com' } });
    fireEvent.change(screen.getByLabelText(/teléfono/i), { target: { value: '123456789' } });

    expect(screen.getByRole('button', { name: /confirmar/i })).toBeEnabled();
  });

  it('llama a postOwner y acciones correctas en add', async () => {
    vi.spyOn(ownerService, 'postOwner').mockResolvedValue({});
    render(<OwnerForm action="add" onDone={mockOnDone} />);

    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Juan' } });
    fireEvent.change(screen.getByLabelText(/apellido/i), { target: { value: 'Perez' } });
    fireEvent.change(screen.getByLabelText(/mail/i), { target: { value: 'juan@mail.com' } });
    fireEvent.change(screen.getByLabelText(/teléfono/i), { target: { value: '123456789' } });

    fireEvent.click(screen.getByRole('button', { name: /confirmar/i }));

    await waitFor(() => {
      expect(ownerService.postOwner).toHaveBeenCalledWith({
        id: 0,
        firstName: 'Juan',
        lastName: 'Perez',
        mail: 'juan@mail.com',
        phone: '123456789',
      });
      expect(mockShowAlert).toHaveBeenCalledWith(expect.any(String), 'success');
      expect(mockRefresh).toHaveBeenCalled();
      expect(mockOnDone).toHaveBeenCalled();
    });
  });

  it('llama a putOwner en edit', async () => {
    const item = { id: 7, firstName: 'Ana', lastName: 'Gomez', mail: 'ana@mail.com', phone: '987654321' };
    vi.spyOn(ownerService, 'putOwner').mockResolvedValue({});
    render(<OwnerForm action="edit" item={item} onDone={mockOnDone} />);

    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Ana Editada' } });
    fireEvent.click(screen.getByRole('button', { name: /confirmar/i }));

    await waitFor(() => {
      expect(ownerService.putOwner).toHaveBeenCalledWith({
        id: 7,
        firstName: 'Ana Editada',
        lastName: 'Gomez',
        mail: 'ana@mail.com',
        phone: '987654321',
      });
      expect(mockShowAlert).toHaveBeenCalledWith(expect.any(String), 'success');
      expect(mockRefresh).toHaveBeenCalled();
      expect(mockOnDone).toHaveBeenCalled();
    });
  });

  it('llama a deleteOwner en delete', async () => {
    const item = { id: 3, firstName: 'Pedro', lastName: 'Lopez', mail: 'pedro@mail.com', phone: '111222333' };
    vi.spyOn(ownerService, 'deleteOwner').mockResolvedValue({});
    render(<OwnerForm action="delete" item={item} onDone={mockOnDone} />);

    fireEvent.click(screen.getByRole('button', { name: /eliminar/i }));

    await waitFor(() => {
      expect(ownerService.deleteOwner).toHaveBeenCalledWith(item);
      expect(mockShowAlert).toHaveBeenCalledWith(expect.any(String), 'success');
      expect(mockRefresh).toHaveBeenCalled();
      expect(mockOnDone).toHaveBeenCalled();
    });
  });

  it('muestra error si falla la acción', async () => {
    vi.spyOn(ownerService, 'postOwner').mockRejectedValue(new Error('fail'));
    render(<OwnerForm action="add" onDone={mockOnDone} />);

    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Error' } });
    fireEvent.change(screen.getByLabelText(/apellido/i), { target: { value: 'Error' } });
    fireEvent.change(screen.getByLabelText(/mail/i), { target: { value: 'error@mail.com' } });
    fireEvent.change(screen.getByLabelText(/teléfono/i), { target: { value: '000000000' } });

    fireEvent.click(screen.getByRole('button', { name: /confirmar/i }));

    await waitFor(() => {
      expect(mockShowAlert).toHaveBeenCalledWith(expect.any(String), 'error');
      expect(mockRefresh).not.toHaveBeenCalled();
      expect(mockOnDone).not.toHaveBeenCalled();
    });
  });
});
