import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CommentForm from '../../../components/forms/CommentForm';
import * as commentService from '../../../services/comment.service';
import * as PropertiesContext from '../../../context/PropertiesContext';
import * as AlertContext from '../../../context/AlertContext';
import { emptyProperty } from '../../../types/property';

describe('CommentForm', () => {
  const mockRefresh = vi.fn();
  const mockShowAlert = vi.fn();
  const mockOnDone = vi.fn();

// Define mockPickedItem con el tipo correcto Picked
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

  // **Agrega este método que falta**
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
    render(<CommentForm action="add" onDone={mockOnDone} />);
    expect(screen.getByLabelText(/descripción/i)).toBeEnabled();
    expect(screen.getByRole('button', { name: /confirmar/i })).toBeDisabled();
  });

  it('habilita el botón confirmar al ingresar texto', () => {
    render(<CommentForm action="add" onDone={mockOnDone} />);
    const input = screen.getByLabelText(/descripción/i);
    fireEvent.change(input, { target: { value: 'Comentario nuevo' } });
    expect(screen.getByRole('button', { name: /confirmar/i })).toBeEnabled();
  });

  it('llama a postComment al guardar en add', async () => {
    vi.spyOn(commentService, 'postComment').mockResolvedValue({});
    render(<CommentForm action="add" onDone={mockOnDone} />);
    const input = screen.getByLabelText(/descripción/i);
    const button = screen.getByRole('button', { name: /confirmar/i });

    fireEvent.change(input, { target: { value: 'Comentario nuevo' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(commentService.postComment).toHaveBeenCalledWith({
        id: 0,
        propertyId: 99,
        description: 'Comentario nuevo',
      });
      expect(mockShowAlert).toHaveBeenCalledWith('Comentario creado!', 'success');
      expect(mockRefresh).toHaveBeenCalled();
      expect(mockOnDone).toHaveBeenCalled();
    });
  });

  it('llama a putComment al guardar en edit', async () => {
    const item = { id: 5, propertyId: 77, description: 'Viejo' };
    vi.spyOn(commentService, 'putComment').mockResolvedValue({});
    render(<CommentForm action="edit" item={item} onDone={mockOnDone} />);
    const input = screen.getByLabelText(/descripción/i);
    const button = screen.getByRole('button', { name: /confirmar/i });

    fireEvent.change(input, { target: { value: 'Nuevo texto' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(commentService.putComment).toHaveBeenCalledWith({
        id: 5,
        propertyId: 77,
        description: 'Nuevo texto',
      });
      expect(mockShowAlert).toHaveBeenCalledWith('Comentario actualizado', 'success');
      expect(mockRefresh).toHaveBeenCalled();
      expect(mockOnDone).toHaveBeenCalled();
    });
  });

  it('llama a deleteComment al guardar en delete', async () => {
    const item = { id: 3, propertyId: 99, description: 'Eliminar esto' };
    vi.spyOn(commentService, 'deleteComment').mockResolvedValue({});
    render(<CommentForm action="delete" item={item} onDone={mockOnDone} />);
    const button = screen.getByRole('button', { name: /eliminar/i });

    fireEvent.click(button);

    await waitFor(() => {
      expect(commentService.deleteComment).toHaveBeenCalledWith(item);
      expect(mockShowAlert).toHaveBeenCalledWith('Comentario eliminado', 'success');
      expect(mockRefresh).toHaveBeenCalled();
      expect(mockOnDone).toHaveBeenCalled();
    });
  });

  it('muestra alerta de error si falla la acción', async () => {
    vi.spyOn(commentService, 'postComment').mockRejectedValue(new Error('fail'));
    render(<CommentForm action="add" onDone={mockOnDone} />);
    const input = screen.getByLabelText(/descripción/i);
    const button = screen.getByRole('button', { name: /confirmar/i });

    fireEvent.change(input, { target: { value: 'Comentario con error' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockShowAlert).toHaveBeenCalledWith(
        'Error al trabajar con el comentario',
        'error'
      );
      expect(mockRefresh).not.toHaveBeenCalled();
      expect(mockOnDone).not.toHaveBeenCalled();
    });
  });
});
