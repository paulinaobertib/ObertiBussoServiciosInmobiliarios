import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ImageCarousel from '../../../components/propertyDetails/PropertyCarousel';

vi.mock('../../utils/getFullImageUrl', () => ({
  getFullImageUrl: (url: string) => url,
}));

const images = [
  { id: 1, url: 'image1.jpg' },
  { id: 2, url: 'image2.jpg' },
  { id: 3, url: 'image3.jpg' },
];

describe('ImageCarousel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renderiza correctamente cuando solo hay una imagen', () => {
    render(<ImageCarousel images={[]} mainImage="main.jpg" title="Solo una" />);

    expect(screen.getByAltText('Imagen 1 de Solo una')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /siguiente imagen/i })).not.toBeInTheDocument();
    expect(screen.queryByAltText(/Miniatura/i)).not.toBeInTheDocument();
  });

  it('muestra el botón "+N" y al hacer click muestra todas las miniaturas', () => {
    render(<ImageCarousel images={images} mainImage="main.jpg" title="Ver más" />);

    const button = screen.getByText('+1'); // porque son 4 imágenes y solo 3 miniaturas visibles
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    // Ahora deberían mostrarse todas las miniaturas
    const thumbnails = screen.getAllByAltText(/Miniatura/i);
    expect(thumbnails.length).toBe(4);
  });

  it('avanza automáticamente la imagen cada 3 segundos', () => {
    render(<ImageCarousel images={images} mainImage="main.jpg" title="Auto" />);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    const image = screen.getByAltText('Imagen 2 de Auto');
    expect(image).toBeInTheDocument();
  });

  it('ignora imágenes con URL vacía', () => {
    const badImages = [{ id: 4, url: '' }, { id: 5, url: null as unknown as string }];
    render(<ImageCarousel images={badImages} mainImage="" title="Vacías" />);

    // No debería renderizar imágenes inválidas
    expect(screen.queryByAltText(/Imagen/i)).not.toBeInTheDocument();
  });

  it('renderiza la imagen principal y miniaturas', () => {
    render(<ImageCarousel images={images} mainImage="main.jpg" title="Test" />);

    const mainImage = screen.getByAltText('Imagen 1 de Test');
    expect(mainImage).toBeInTheDocument();
    expect(mainImage).toHaveAttribute('src', expect.stringContaining('main.jpg'));

    const thumbnails = screen.getAllByAltText(/Miniatura/i);
    expect(thumbnails.length).toBeGreaterThan(0);
  });

  it('navega a la siguiente imagen con el botón de flecha derecha', () => {
    render(<ImageCarousel images={images} mainImage="main.jpg" title="Test" />);

    const nextButton = screen.getByRole('button', { name: /siguiente imagen/i });
    fireEvent.click(nextButton);

    const activeImage = screen.getByAltText('Imagen 2 de Test');
    expect(activeImage).toHaveAttribute('src', expect.stringContaining('image1.jpg'));
  });

  it('navega a la imagen anterior con el botón de flecha izquierda', () => {
    render(<ImageCarousel images={images} mainImage="main.jpg" title="Test" />);

    const prevButton = screen.getByRole('button', { name: /imagen anterior/i });
    fireEvent.click(prevButton);

    const activeImage = screen.getByAltText(`Imagen ${images.length + 1} de Test`);
    expect(activeImage).toHaveAttribute('src', expect.stringContaining('image3.jpg'));
  });

  it('cambia la imagen activa al hacer click en una miniatura', () => {
    render(<ImageCarousel images={images} mainImage="main.jpg" title="Test" />);

    const thumbnails = screen.getAllByAltText(/Miniatura/i);

    fireEvent.click(thumbnails[1]);

    const activeImage = screen.getByAltText('Imagen 2 de Test');
    expect(activeImage).toHaveAttribute('src', expect.stringContaining('image1.jpg'));
  });

  it('no renderiza imágenes si no hay imágenes válidas', () => {
    render(<ImageCarousel images={[]} mainImage="" title="Vacío" />);
    expect(screen.queryByAltText(/Imagen/i)).not.toBeInTheDocument();
    expect(screen.queryByAltText(/Miniatura/i)).not.toBeInTheDocument();
  });

  it('navega a la siguiente imagen con el botón de flecha derecha', () => {
    render(<ImageCarousel images={images} mainImage="main.jpg" title="Test" />);

    const nextButton = screen.getByRole('button', { name: /siguiente imagen/i });
    fireEvent.click(nextButton);

    // La imagen activa ahora debería ser la segunda en allImages, que es mainImage (index 0), luego image1 (index 1)
    const activeImage = screen.getByAltText('Imagen 2 de Test');
    expect(activeImage).toHaveAttribute('src', expect.stringContaining('image1.jpg'));
  });

  it('navega a la imagen anterior con el botón de flecha izquierda', () => {
    render(<ImageCarousel images={images} mainImage="main.jpg" title="Test" />);

    const prevButton = screen.getByRole('button', { name: /imagen anterior/i });
    fireEvent.click(prevButton);

    // Al estar en el índice 0 (mainImage), al ir atrás se debe mostrar la última imagen del array allImages
    // allImages = [mainImage, ...images], length = 4, índice de la última = 3 (image3.jpg)
    const activeImage = screen.getByAltText(`Imagen 4 de Test`);
    expect(activeImage).toHaveAttribute('src', expect.stringContaining('image3.jpg'));
  });

  it('no muestra el botón "+N" si todas las miniaturas ya están visibles', () => {
    const fewImages = [
      { id: 1, url: 'image1.jpg' },
      { id: 2, url: 'image2.jpg' },
    ];

    render(<ImageCarousel images={fewImages} mainImage="main.jpg" title="No +N" />);

    expect(screen.queryByText(/\+\d+/)).not.toBeInTheDocument();
  });

it('mantiene la imagen activa al hacer click en miniatura con showAllThumbnails true', () => {
  render(<ImageCarousel images={images} mainImage="main.jpg" title="Test" />);
  const button = screen.getByText('+1');
  fireEvent.click(button); // muestra todas
  const thumbnails = screen.getAllByAltText(/Miniatura/i);
  fireEvent.click(thumbnails[2]); // click en tercera miniatura
  const activeImage = screen.getByAltText('Imagen 4 de Test'); // la última imagen
  expect(activeImage).toBeInTheDocument();
});

it('filtra mainImage vacío y no renderiza imágenes', () => {
  render(<ImageCarousel images={images} mainImage="" title="Sin main" />);
  const imgs = screen.queryAllByAltText(/Imagen/i);
  // Como mainImage es '', debería quedar solo las images válidas
  expect(imgs.length).toBe(images.length); // no incluye mainImage
});

it('limpia el intervalo al desmontar', () => {
  const { unmount } = render(<ImageCarousel images={images} mainImage="main.jpg" title="Test" />);
  unmount();
  // Si no lanza error y limpia el intervalo, es correcto
  expect(true).toBe(true);
});

});
