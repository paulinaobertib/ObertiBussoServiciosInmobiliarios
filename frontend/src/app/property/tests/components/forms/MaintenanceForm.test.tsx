import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MaintenanceForm from '../../../components/forms/MaintenanceForm';
import * as maintenanceService from '../../../services/maintenance.service';
import * as PropertiesContext from '../../../context/PropertiesContext';
import * as AlertContext from '../../../context/AlertContext';
import { emptyProperty } from '../../../types/property';

describe('MaintenanceForm', () => {
  const mockRefresh = vi.fn();
  const mockShowAlert = vi.fn();
  const mockOnDone = vi.fn();

  const mockPickedItem = {
    type: 'property' as const,
    value: {
      ...emptyProperty,
      id: 99,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(PropertiesContext, 'usePropertyCrud').mockReturnValue({
      refresh: mockRefresh,
      pickedItem: mockPickedItem,
      refreshComments: vi.fn(),
      commentsList: [],
      amenitiesList: [],
      ownersList: [],
      neighborhoodsList: [],
      typesList: [],
      maintenancesList: [],
      operationsList: [],

      pickItem: vi.fn(),
      currentCategory: null,
      selected: {
        owner: null,
        neighborhood: null,
        type: null,
        amenities: [],
      },
      setSelected: vi.fn(),
      toggleSelect: vi.fn(),
      resetSelected: vi.fn(),
      data: [],
      categoryLoading: false,
      refreshAllCatalogs: vi.fn(),
      refreshTypes: vi.fn(),
      refreshMaintenances: vi.fn(),

      buildSearchParams: vi.fn(),
      currentProperty: null,
      loadProperty: vi.fn(),
      loadingProperty: false,
      errorProperty: null,
      comparisonItems: [],
      selectedPropertyIds: [],
      toggleCompare: vi.fn(),
      addToComparison: vi.fn(),
      clearComparison: vi.fn(),
    });

    vi.spyOn(AlertContext, 'useGlobalAlert').mockReturnValue({
      showAlert: mockShowAlert,
    });
  });

  it('renderiza correctamente para la acción add', () => {
    render(<MaintenanceForm action="add" onDone={mockOnDone} />);

    expect(screen.getByLabelText(/título/i)).toBeEnabled();
    expect(screen.getByLabelText(/fecha/i)).toBeEnabled();
    expect(screen.getByLabelText(/descripción/i)).toBeEnabled();
    expect(screen.getByRole('button', { name: /confirmar/i })).toBeDisabled();
  });

  it('habilita el botón confirmar al completar el formulario', () => {
    render(<MaintenanceForm action="add" onDone={mockOnDone} />);
    fireEvent.change(screen.getByLabelText(/título/i), { target: { value: 'Mantenimiento 1' } });
    fireEvent.change(screen.getByLabelText(/fecha/i), { target: { value: '2025-05-25T12:00' } });
    fireEvent.change(screen.getByLabelText(/descripción/i), { target: { value: 'Descripción de mantenimiento' } });

    expect(screen.getByRole('button', { name: /confirmar/i })).toBeEnabled();
  });

  it('llama a postMaintenance al guardar en add', async () => {
    vi.spyOn(maintenanceService, 'postMaintenance').mockResolvedValue({});
    render(<MaintenanceForm action="add" onDone={mockOnDone} />);
    
    fireEvent.change(screen.getByLabelText(/título/i), { target: { value: 'Mantenimiento 1' } });
    fireEvent.change(screen.getByLabelText(/fecha/i), { target: { value: '2025-05-25T12:00' } });
    fireEvent.change(screen.getByLabelText(/descripción/i), { target: { value: 'Descripción de mantenimiento' } });

    fireEvent.click(screen.getByRole('button', { name: /confirmar/i }));

    await waitFor(() => {
      expect(maintenanceService.postMaintenance).toHaveBeenCalledWith({
        id: 0,
        propertyId: 99,
        title: 'Mantenimiento 1',
        description: 'Descripción de mantenimiento',
        date: '2025-05-25T12:00',
      });
      expect(mockShowAlert).toHaveBeenCalledWith('¡Mantenimiento creado!', 'success');
      expect(mockRefresh).toHaveBeenCalled();
      expect(mockOnDone).toHaveBeenCalled();
    });
  });

  it('llama a putMaintenance al guardar en edit', async () => {
    const item = {
      id: 5,
      propertyId: 77,
      title: 'Antiguo',
      description: 'Antigua descripción',
      date: '2025-05-01T10:00',
    };
    vi.spyOn(maintenanceService, 'putMaintenance').mockResolvedValue({});
    render(<MaintenanceForm action="edit" item={item} onDone={mockOnDone} />);

    fireEvent.change(screen.getByLabelText(/título/i), { target: { value: 'Nuevo título' } });
    fireEvent.click(screen.getByRole('button', { name: /confirmar/i }));

    await waitFor(() => {
      expect(maintenanceService.putMaintenance).toHaveBeenCalledWith({
        id: 5,
        propertyId: 77,
        title: 'Nuevo título',
        description: 'Antigua descripción',
        date: '2025-05-01T10:00',
      });
      expect(mockShowAlert).toHaveBeenCalledWith('Mantenimiento actualizado', 'success');
      expect(mockRefresh).toHaveBeenCalled();
      expect(mockOnDone).toHaveBeenCalled();
    });
  });

  it('llama a deleteMaintenance al confirmar en delete', async () => {
    const item = {
      id: 3,
      propertyId: 99,
      title: 'Eliminar mantenimiento',
      description: 'Eliminar esta tarea',
      date: '2025-05-20T09:00',
    };
    vi.spyOn(maintenanceService, 'deleteMaintenance').mockResolvedValue({});
    render(<MaintenanceForm action="delete" item={item} onDone={mockOnDone} />);

    fireEvent.click(screen.getByRole('button', { name: /eliminar/i }));

    await waitFor(() => {
      expect(maintenanceService.deleteMaintenance).toHaveBeenCalledWith(item);
      expect(mockShowAlert).toHaveBeenCalledWith('Mantenimiento eliminado', 'success');
      expect(mockRefresh).toHaveBeenCalled();
      expect(mockOnDone).toHaveBeenCalled();
    });
  });

  it('muestra alerta de error si falla la acción', async () => {
    vi.spyOn(maintenanceService, 'postMaintenance').mockRejectedValue(new Error('fail'));
    render(<MaintenanceForm action="add" onDone={mockOnDone} />);

    fireEvent.change(screen.getByLabelText(/título/i), { target: { value: 'Error mantenimiento' } });
    fireEvent.change(screen.getByLabelText(/fecha/i), { target: { value: '2025-05-25T12:00' } });
    fireEvent.change(screen.getByLabelText(/descripción/i), { target: { value: 'Descripción que falla' } });

    fireEvent.click(screen.getByRole('button', { name: /confirmar/i }));

    await waitFor(() => {
      expect(mockShowAlert).toHaveBeenCalledWith('Error al trabajar con el mantenimiento', 'error');
      expect(mockRefresh).not.toHaveBeenCalled();
      expect(mockOnDone).not.toHaveBeenCalled();
    });
  });
});
