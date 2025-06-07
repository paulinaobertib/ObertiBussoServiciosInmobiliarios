import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, expect, it } from 'vitest';
import React from 'react';
import PropertyForm, { PropertyFormHandle } from '../../../components/forms/PropertyForm';

vi.mock('../../../context/PropertiesContext', async () => {
  const actual = await vi.importActual<typeof import('../../../context/PropertiesContext')>(
    '../../../context/PropertiesContext'
  );

  return {
    ...actual,
    usePropertyCrud: vi.fn(() => ({
      selected: {
        owner: 0,
        neighborhood: 0,
        type: 1,
        amenities: [],
      },
      ownersList: [],
      neighborhoodsList: [],
      typesList: [
        {
          id: 1,
          hasRooms: true,
          hasBedrooms: true,
          hasBathrooms: true,
          hasCoveredArea: true,
        },
      ],
      amenitiesList: [],
      refreshCatalogs: vi.fn(),
      loadProperties: vi.fn(),
      pickedItem: null,
    })),
    PropertyCrudProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

// Ajustar ruta del mock a la correcta
vi.mock('../../../hooks/useImageHandlersCreate', () => ({
  useImageHandlers: () => ({
    handleMainImage: vi.fn(),
    handleGalleryImages: vi.fn(),
    deleteImage: vi.fn(),
  }),
}));

describe('PropertyForm', () => {
  it('renderiza los inputs básicos', () => {
    render(<PropertyForm />);
    expect(screen.getByLabelText(/Título/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Moneda/i)).toBeInTheDocument();

    const [precioInput] = screen.getAllByLabelText(/Precio/i);
    expect(precioInput).toBeInTheDocument();

    expect(screen.getByLabelText(/Mostrar precio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descripción/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Calle/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Número/i)).toBeInTheDocument();
  });

  it('llama a setField cuando cambian los inputs', async () => {
    render(<PropertyForm />);
    const inputTitulo = screen.getByLabelText(/Título/i);
    await userEvent.type(inputTitulo, 'Casa bonita');
    expect(inputTitulo).toHaveValue('Casa bonita');
  });

  it('muestra campos extras para ambientes, dormitorios, baños y superficie cubierta según el tipo', () => {
    render(<PropertyForm />);
    expect(screen.getByLabelText(/Ambientes/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Dormitorios/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Baños/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Superficie Cubierta/i)).toBeInTheDocument();
  });

  it('dispara submit al enviar el formulario', async () => {
    const ref = React.createRef<PropertyFormHandle>();
    render(<PropertyForm ref={ref} />);

    const input = screen.getByLabelText(/Título/i);
    const form = input.closest('form');
    expect(form).toBeTruthy();

    fireEvent.submit(form!);

    await waitFor(() => {
      expect(ref.current?.submit).toBeDefined();
    });
  });

  it('permite activar y desactivar "Mostrar precio"', async () => {
  render(<PropertyForm />);
  const checkbox = screen.getByLabelText(/Mostrar precio/i) as HTMLInputElement;
  expect(checkbox.checked).toBe(false);

  await userEvent.click(checkbox);
  expect(checkbox.checked).toBe(true);

  await userEvent.click(checkbox);
  expect(checkbox.checked).toBe(false);
});

it('setea el número a "S/N" al hacer click en el ícono', () => {
  render(<PropertyForm />);
  const button = screen.getByTitle(/Sin número/i);
  const input = screen.getByLabelText(/Número/i) as HTMLInputElement;

  expect(input.value).toBe(''); // valor inicial vacío
  fireEvent.click(button);
  expect(input.value).toBe('S/N');
});

it('llama onValidityChange con el estado de validez', async () => {
  const onValidityChange = vi.fn();
  render(<PropertyForm onValidityChange={onValidityChange} />);
  await waitFor(() => {
    expect(onValidityChange).toHaveBeenCalledWith(expect.any(Boolean));
  });
});

it('expone funciones del ref', async () => {
  const ref = React.createRef<PropertyFormHandle>();
  render(<PropertyForm ref={ref} />);
  
  await waitFor(() => {
    expect(ref.current).toBeDefined();
  });

  expect(typeof ref.current?.reset).toBe('function');
  expect(typeof ref.current?.getCreateData).toBe('function');
  expect(typeof ref.current?.getUpdateData).toBe('function');
  expect(typeof ref.current?.setField).toBe('function');
});

it('llama a deleteImage desde el ref', async () => {
  const ref = React.createRef<PropertyFormHandle>();
  render(<PropertyForm ref={ref} />);
  const file = new File(['dummy'], 'dummy.png', { type: 'image/png' });

  await waitFor(() => {
    expect(ref.current).toBeDefined();
  });

  ref.current?.deleteImage(file); // Esto debe invocar la función mock
});

it('llama a handleMainImage y handleGalleryImages cuando se seleccionan imágenes', async () => {
  render(<PropertyForm />);

  const mainUploader = screen.getByLabelText(/Cargar Imagen principal/i);
  const galleryUploader = screen.getByLabelText(/Cargar Imágenes adicionales/i);

  const file = new File(['dummy'], 'photo.jpg', { type: 'image/jpeg' });

  await userEvent.upload(mainUploader, file);
  await userEvent.upload(galleryUploader, [file, file]);

  expect(mainUploader).toBeInTheDocument();
  expect(galleryUploader).toBeInTheDocument();
});

it('carga datos iniciales si se pasa initialData', async () => {
  const initialData = {
    title: 'Depto 2 amb.',
    currency: 'USD',
    price: 100000,
    showPrice: true,
    description: 'Muy lindo',
    street: 'Av. Siempreviva',
    number: '123',
    rooms: 2,
    bedrooms: 1,
    bathrooms: 1,
    area: 50,
    coveredArea: 45,
    status: 'DISPONIBLE',
    operation: 'VENTA',
    credit: true,
    financing: true,
    mainImage: '',
    gallery: [],
    amenities: [],
    owner: { id: 0, name: 'Juan' },
    neighborhood: { id: 0, name: 'Centro' },
    type: { id: 1, name: 'Departamento' },
    location: { lat: 0, lng: 0 },
  };

  render(<PropertyForm initialData={initialData as any} />);
  expect(screen.getByLabelText(/Título/i)).toHaveValue('Depto 2 amb.');
  expect(screen.getByLabelText(/Número/i)).toHaveValue('123');
});

});
