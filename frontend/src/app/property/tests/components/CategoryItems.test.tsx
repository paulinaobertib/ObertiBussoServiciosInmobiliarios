import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CategoryItems from '../../components/CategoryPanel';
import type { Amenity } from '../../types/amenity';
import type { Property } from '../../types/property';
import * as propertyService from '../../services/property.service';
import { emptyProperty } from '../../types/property';
import type { Owner } from '../../types/owner';

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mocks del contexto y utilidades
const mockUsePropertyCrud = {
  currentCategory: 'amenity' as 'amenity' | 'owner' | 'neighborhood' | 'type' | 'property' | null,
  data: [] as Amenity[] | Property[] | Owner[],
  categoryLoading: false,
  selected: {
    amenities: [] as number[],
    owner: null as number | null,
    neighborhood: null as number | null,
    type: null as number | null,
  },
  toggleSelect: vi.fn(),
  refresh: vi.fn(),
};
vi.mock('../../context/PropertiesContext', () => ({
  usePropertyCrud: () => mockUsePropertyCrud,
}));

const mockUseConfirmDialog = {
  ask: vi.fn((_msg: string, cb: () => void) => cb()),
  DialogUI: <div>ConfirmDialog</div>,
};
vi.mock('../../utils/ConfirmDialog', () => ({
  useConfirmDialog: () => mockUseConfirmDialog,
}));

const mockShowAlert = vi.fn();
vi.mock('../../context/AlertContext', () => ({
  useGlobalAlert: () => ({ showAlert: mockShowAlert }),
}));

vi.mock('../../services/property.service', () => ({
  deleteProperty: vi.fn(() => Promise.resolve()),
}));

vi.mock('../../components/ModalItem', () => ({
  default: () => <div>ModalItem</div>,
}));

vi.mock('../../components/PropertyRowItems', () => ({
  getPropertyRowData: (item: any) => ({
    columns: [item.title ?? item.name ?? '-'],
    extraActions: [
      {
        icon: <button role="button" aria-label="Editar">Editar</button>,
        title: 'Editar',
        onClick: () => { },
      },
      {
        icon: <button role="button" title="Eliminar">Eliminar</button>,
        title: 'Eliminar',
        onClick: () => { },
      },
    ],
  }),
}));

describe('CategoryItems', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('no renderiza nada si no hay categoría', () => {
    mockUsePropertyCrud.currentCategory = null;
    const { container } = render(<CategoryItems />);
    expect(container).toBeEmptyDOMElement();
    mockUsePropertyCrud.currentCategory = 'amenity';
  });

  it('muestra loader cuando categoryLoading es true', () => {
    mockUsePropertyCrud.categoryLoading = true;
    render(<CategoryItems />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    mockUsePropertyCrud.categoryLoading = false;
  });

  it('muestra mensaje si no hay datos', () => {
    mockUsePropertyCrud.data = [];
    render(<CategoryItems />);
    expect(screen.getByText(/no hay datos disponibles/i)).toBeInTheDocument();
  });

  it('navega a los detalles de la propiedad al hacer clic en el botón "ver propiedad"', async () => {
    mockUsePropertyCrud.currentCategory = 'property';
    mockUsePropertyCrud.data = [
      {
        id: 1,
        title: 'Propiedad 1',
        firstName: '',
        lastName: '',
      } as any,
    ];

    render(<CategoryItems />);

    const viewButton = await screen.findByLabelText(/ver propiedad/i);
    fireEvent.click(viewButton);

    expect(mockNavigate).toHaveBeenCalledWith('/properties/1'); // Asegúrate que esta ruta sea correcta en tu ROUTES
  });

  it('muestra lista de items y columnas para categoría amenity', () => {
    mockUsePropertyCrud.currentCategory = 'amenity';
    mockUsePropertyCrud.data = [
      { id: 1, name: 'Amenity 1' },
      { id: 2, name: 'Amenity 2' },
    ];
    mockUsePropertyCrud.selected.amenities = [1];

    render(<CategoryItems />);

    expect(screen.getByText('Nombre')).toBeInTheDocument();
    expect(screen.getByText('Amenity 1')).toBeInTheDocument();
    expect(screen.getByText('Amenity 2')).toBeInTheDocument();
  });

  it('click en fila llama toggleSelect para no propiedad', () => {
    mockUsePropertyCrud.currentCategory = 'amenity';
    mockUsePropertyCrud.data = [{ id: 1, name: 'Amenity 1' }];
    mockUsePropertyCrud.selected.amenities = [];
    render(<CategoryItems />);
    fireEvent.click(screen.getByText('Amenity 1').closest('div')!);
    expect(mockUsePropertyCrud.toggleSelect).toHaveBeenCalledWith(1);
  });

  it('botón agregar navega si categoría es property', () => {
    mockUsePropertyCrud.currentCategory = 'property';
    mockUsePropertyCrud.data = [];
    render(<CategoryItems />);
    const addButton = screen.getByRole('button', { name: /agregar nuevo/i });
    fireEvent.click(addButton);
    expect(mockNavigate).toHaveBeenCalled();
    mockUsePropertyCrud.currentCategory = 'amenity'; // reset
  });

  it('botón agregar abre modal si categoría no es property', () => {
    mockUsePropertyCrud.currentCategory = 'amenity';
    render(<CategoryItems />);
    const addButton = screen.getByRole('button', { name: /agregar nuevo/i });
    fireEvent.click(addButton);
    expect(screen.getByText(/ModalItem/i)).toBeInTheDocument();
  });

  it('editar y eliminar abren modales correctamente para no propiedad', () => {
    mockUsePropertyCrud.currentCategory = 'amenity';
    mockUsePropertyCrud.data = [{ id: 1, name: 'Amenity 1' }];
    render(<CategoryItems />);
    const editBtn = screen.getByLabelText(/editar/i);
    const deleteBtn = screen.getByLabelText(/eliminar/i);

    fireEvent.click(editBtn);
    fireEvent.click(deleteBtn);
    expect(screen.getByText(/ModalItem/i)).toBeInTheDocument();
  });

  it('eliminar propiedad llama deleteProperty y muestra alert', async () => {
    // Mockear deleteProperty para que resuelva con éxito
    const deletePropertySpy = vi.spyOn(propertyService, 'deleteProperty').mockResolvedValueOnce({});

    mockUsePropertyCrud.currentCategory = 'property';
    mockUsePropertyCrud.data = [
      {
        ...emptyProperty,
        id: 1,
        title: 'Propiedad 1',
      },
    ];

    render(<CategoryItems />);

    const deleteBtn = screen.getByLabelText(/eliminar/i);
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(deletePropertySpy).toHaveBeenCalled();
      expect(mockShowAlert).toHaveBeenCalledWith(expect.any(String), 'success');
      expect(mockUsePropertyCrud.refresh).toHaveBeenCalled();
    });
  });

  it('error al eliminar propiedad muestra alerta error', async () => {
    mockUsePropertyCrud.currentCategory = 'property';
    mockUsePropertyCrud.data = [
      { id: 1, title: 'Propiedad 1', firstName: '', lastName: '' } as any,
    ];

    const deletePropertySpy = vi.spyOn(propertyService, 'deleteProperty').mockRejectedValueOnce(new Error('fail'));

    render(<CategoryItems />);

    screen.debug();

    const deleteBtn = screen.getByLabelText(/eliminar/i);
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      console.log('deletePropertySpy calls:', deletePropertySpy.mock.calls);
      console.log('mockShowAlert calls:', mockShowAlert.mock.calls);

      expect(deletePropertySpy).toHaveBeenCalled();
      expect(mockShowAlert).toHaveBeenCalledWith(expect.any(String), 'error');
    });
  });

  it('muestra SearchBarOwner solo si la categoría es "owner"', () => {
    mockUsePropertyCrud.currentCategory = 'owner';
    mockUsePropertyCrud.data = [];

    render(<CategoryItems />);
    expect(screen.getByRole('textbox', { name: /buscar propietario/i })).toBeInTheDocument();

    cleanup();

    mockUsePropertyCrud.currentCategory = 'amenity';
    render(<CategoryItems />);
    expect(screen.queryByRole('textbox', { name: /buscar propietario/i })).not.toBeInTheDocument();
  });

  it('marca fila con fondo si está seleccionada', () => {
    mockUsePropertyCrud.currentCategory = 'amenity';
    mockUsePropertyCrud.data = [{ id: 99, name: 'Piscina' }];
    mockUsePropertyCrud.selected.amenities = [99];

    render(<CategoryItems />);
    expect(screen.getByText('Piscina')).toBeInTheDocument();

  });

});

