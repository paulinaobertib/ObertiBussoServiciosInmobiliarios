import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AmenityForm from '../../../components/categories/AmenityForm';
import * as amenityService from '../../../services/amenity.service';
import * as PropertiesContext from '../../../context/PropertiesContext';
import * as AlertContext from '../../../../shared/context/AlertContext';

describe('AmenityForm', () => {
  const mockRefresh = vi.fn();
  const mockShowAlert = vi.fn();
  const mockOnDone = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mockeamos el hook del contexto PropertiesContext para que devuelva nuestro mock de refresh
    vi.spyOn(PropertiesContext, 'usePropertyCrud').mockReturnValue({
      refresh: mockRefresh,
    } as any);

    // Mockeamos el hook del contexto AlertContext para que devuelva nuestro mock de showAlert
    vi.spyOn(AlertContext, 'useGlobalAlert').mockReturnValue({
      showAlert: mockShowAlert,
    });
  });

  it('renderiza correctamente para la acción add', () => {
    render(<AmenityForm action="add" onDone={mockOnDone} />);
    expect(screen.getByLabelText(/nombre/i)).toBeEnabled();
    // El botón debe estar deshabilitado porque el input está vacío
    expect(screen.getByRole('button', { name: /confirmar/i })).toBeDisabled();
  });

  it('renderiza correctamente para la acción delete', () => {
    const item = { id: 1, name: 'Servicio de prueba' };
    render(<AmenityForm action="delete" item={item} onDone={mockOnDone} />);
    expect(screen.getByLabelText(/nombre/i)).toHaveValue('Servicio de prueba');
    expect(screen.getByLabelText(/nombre/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /eliminar/i })).toBeEnabled();
  });

  it('habilita el botón confirmar cuando se escribe un nombre en add', () => {
    render(<AmenityForm action="add" onDone={mockOnDone} />);
    const input = screen.getByLabelText(/nombre/i);
    fireEvent.change(input, { target: { value: 'Nuevo servicio' } });
    expect(screen.getByRole('button', { name: /confirmar/i })).toBeEnabled();
  });

  it('llama a postAmenity, muestra alerta, refresca y ejecuta onDone al guardar en add', async () => {
    vi.spyOn(amenityService, 'postAmenity').mockResolvedValue({});
    render(<AmenityForm action="add" onDone={mockOnDone} />);
    const input = screen.getByLabelText(/nombre/i);
    const button = screen.getByRole('button', { name: /confirmar/i });

    fireEvent.change(input, { target: { value: 'Nuevo servicio' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(amenityService.postAmenity).toHaveBeenCalledWith({ name: 'Nuevo servicio' });
      expect(mockShowAlert).toHaveBeenCalledWith(expect.any(String), 'success');
      expect(mockRefresh).toHaveBeenCalled();
      expect(mockOnDone).toHaveBeenCalled();
    });
  });

  it('llama a putAmenity al guardar en edit', async () => {
    const item = { id: 1, name: 'Servicio viejo' };
    vi.spyOn(amenityService, 'putAmenity').mockResolvedValue({});
    render(<AmenityForm action="edit" item={item} onDone={mockOnDone} />);
    const input = screen.getByLabelText(/nombre/i);
    const button = screen.getByRole('button', { name: /confirmar/i });

    fireEvent.change(input, { target: { value: 'Servicio actualizado' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(amenityService.putAmenity).toHaveBeenCalledWith({ ...item, name: 'Servicio actualizado' });
      expect(mockShowAlert).toHaveBeenCalledWith(expect.any(String), 'success');
      expect(mockRefresh).toHaveBeenCalled();
      expect(mockOnDone).toHaveBeenCalled();
    });
  });

  it('llama a deleteAmenity al guardar en delete', async () => {
    const item = { id: 1, name: 'Servicio a eliminar' };
    vi.spyOn(amenityService, 'deleteAmenity').mockResolvedValue({});
    render(<AmenityForm action="delete" item={item} onDone={mockOnDone} />);
    const button = screen.getByRole('button', { name: /eliminar/i });

    fireEvent.click(button);

    await waitFor(() => {
      expect(amenityService.deleteAmenity).toHaveBeenCalledWith(item);
      expect(mockShowAlert).toHaveBeenCalledWith(expect.any(String), 'success');
      expect(mockRefresh).toHaveBeenCalled();
      expect(mockOnDone).toHaveBeenCalled();
    });
  });

  it('muestra alerta de error cuando la llamada al servicio falla', async () => {
    vi.spyOn(amenityService, 'postAmenity').mockRejectedValue(new Error('fail'));
    render(<AmenityForm action="add" onDone={mockOnDone} />);
    const input = screen.getByLabelText(/nombre/i);
    const button = screen.getByRole('button', { name: /confirmar/i });

    fireEvent.change(input, { target: { value: 'Falla servicio' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockShowAlert).toHaveBeenCalledWith(expect.any(String), 'error');
      expect(mockRefresh).not.toHaveBeenCalled();
      expect(mockOnDone).not.toHaveBeenCalled();
    });
  });
});
