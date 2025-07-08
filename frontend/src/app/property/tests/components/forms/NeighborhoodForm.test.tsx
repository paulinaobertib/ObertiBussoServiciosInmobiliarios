import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NeighborhoodForm from '../../../components/categories/NeighborhoodForm';
import * as neighborhoodService from '../../../services/neighborhood.service';
import * as PropertiesContext from '../../../context/PropertiesContext';
import * as AlertContext from '../../../../shared/context/AlertContext';
import { NeighborhoodType } from '../../../types/neighborhood';

describe('NeighborhoodForm', () => {
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
  render(
    <NeighborhoodForm
      action="delete"
      item={{ id: 1, name: 'Barrio 1', city: 'Ciudad', type: NeighborhoodType.CERRADO }}
      onDone={mockOnDone}
    />
  );

  expect(screen.getByLabelText(/nombre/i)).toBeDisabled();
  expect(screen.getByLabelText(/ciudad/i)).toBeDisabled();

  const selectTipo = screen.getByLabelText(/tipo/i);
  expect(selectTipo).toHaveAttribute('aria-disabled', 'true');

  expect(screen.getByRole('button', { name: /eliminar/i })).toBeEnabled();
});

it('muestra error si falla la acción', async () => {
  vi.spyOn(neighborhoodService, 'postNeighborhood').mockRejectedValue(new Error('fail'));
  render(<NeighborhoodForm action="add" onDone={mockOnDone} />);

  fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Barrio Error' } });
  fireEvent.change(screen.getByLabelText(/ciudad/i), { target: { value: 'Ciudad Error' } });

  fireEvent.mouseDown(screen.getByLabelText(/tipo/i));
  const options = await screen.findAllByRole('option', { name: /cerrado/i });
  fireEvent.click(options[0]);

  fireEvent.click(screen.getByRole('button', { name: /confirmar/i }));

  await waitFor(() => {
expect(mockShowAlert).toHaveBeenCalledWith(expect.any(String), 'error');
    expect(mockRefresh).not.toHaveBeenCalled();
    expect(mockOnDone).not.toHaveBeenCalled();
  });
});

  it('valida que campos estén completos para habilitar botón en add', async () => {
    render(<NeighborhoodForm action="add" onDone={mockOnDone} />);

    expect(screen.getByRole('button', { name: /confirmar/i })).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Barrio Nuevo' } });
    fireEvent.change(screen.getByLabelText(/ciudad/i), { target: { value: 'Ciudad Nueva' } });

    fireEvent.mouseDown(screen.getByLabelText(/tipo/i));
    const option = await screen.findByRole('option', { name: /abierto/i });
    fireEvent.click(option);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /confirmar/i })).toBeEnabled();
    });
  });

  it('llama a postNeighborhood y acciones correctas en add', async () => {
    vi.spyOn(neighborhoodService, 'postNeighborhood').mockResolvedValue({});
    render(<NeighborhoodForm action="add" onDone={mockOnDone} />);

    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Barrio Nuevo' } });
    fireEvent.change(screen.getByLabelText(/ciudad/i), { target: { value: 'Ciudad Nueva' } });

    fireEvent.mouseDown(screen.getByLabelText(/tipo/i));
    const option = await screen.findByRole('option', { name: /abierto/i });
    fireEvent.click(option);

    fireEvent.click(screen.getByRole('button', { name: /confirmar/i }));

    await waitFor(() => {
      expect(neighborhoodService.postNeighborhood).toHaveBeenCalledWith({
        id: 0,
        name: 'Barrio Nuevo',
        city: 'Ciudad Nueva',
        type: NeighborhoodType.ABIERTO,
      });
      expect(mockShowAlert).toHaveBeenCalledWith('¡Barrio creado con éxito!', 'success');
      expect(mockRefresh).toHaveBeenCalled();
      expect(mockOnDone).toHaveBeenCalled();
    });
  });

  it('llama a putNeighborhood en edit', async () => {
    const item = { id: 7, name: 'Antiguo Barrio', city: 'Ciudad', type: NeighborhoodType.SEMICERRADO };
    vi.spyOn(neighborhoodService, 'putNeighborhood').mockResolvedValue({});
    render(<NeighborhoodForm action="edit" item={item} onDone={mockOnDone} />);

    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Barrio Editado' } });

    fireEvent.click(screen.getByRole('button', { name: /confirmar/i }));

    await waitFor(() => {
      expect(neighborhoodService.putNeighborhood).toHaveBeenCalledWith({
        id: 7,
        name: 'Barrio Editado',
        city: 'Ciudad',
        type: NeighborhoodType.SEMICERRADO,
      });
      expect(mockShowAlert).toHaveBeenCalledWith('¡Barrio editado con éxito!', 'success');
      expect(mockRefresh).toHaveBeenCalled();
      expect(mockOnDone).toHaveBeenCalled();
    });
  });

  it('llama a deleteNeighborhood en delete', async () => {
    const item = { id: 3, name: 'Barrio Borrar', city: 'Ciudad', type: NeighborhoodType.CERRADO };
    vi.spyOn(neighborhoodService, 'deleteNeighborhood').mockResolvedValue({});
    render(<NeighborhoodForm action="delete" item={item} onDone={mockOnDone} />);

    fireEvent.click(screen.getByRole('button', { name: /eliminar/i }));

    await waitFor(() => {
      expect(neighborhoodService.deleteNeighborhood).toHaveBeenCalledWith(item);
      expect(mockShowAlert).toHaveBeenCalledWith('¡Barrio eliminado con éxito!', 'success');
      expect(mockRefresh).toHaveBeenCalled();
      expect(mockOnDone).toHaveBeenCalled();
    });
  });

it('muestra error si falla la acción', async () => {
  vi.spyOn(neighborhoodService, 'postNeighborhood').mockRejectedValue(new Error('fail'));
  render(<NeighborhoodForm action="add" onDone={mockOnDone} />);

  fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Barrio Error' } });
  fireEvent.change(screen.getByLabelText(/ciudad/i), { target: { value: 'Ciudad Error' } });

  fireEvent.mouseDown(screen.getByLabelText(/tipo/i));
  const options = await screen.findAllByRole('option', { name: /cerrado/i });
  fireEvent.click(options[0]);

  fireEvent.click(screen.getByRole('button', { name: /confirmar/i }));

  await waitFor(() => {
    expect(mockShowAlert).toHaveBeenCalledWith('Error al trabajar con el barrio', 'error');
    expect(mockRefresh).not.toHaveBeenCalled();
    expect(mockOnDone).not.toHaveBeenCalled();
  });
});

});
