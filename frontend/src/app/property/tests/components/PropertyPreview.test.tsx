import { render, screen, fireEvent } from '@testing-library/react';
import PropertyPreview from '../../../shared/components/images/ImagePreview';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';

beforeAll(() => {
  global.URL.createObjectURL = vi.fn(() => 'mocked-object-url');
});

afterAll(() => {
  // Para "limpiar" el mock, reasignar a undefined:
    (global.URL as any).createObjectURL = undefined;
});

describe('PropertyPreview', () => {
  const stringImage = 'http://example.com/image1.jpg';
  const fileImage = new File(['dummy content'], 'image2.png', { type: 'image/png' });

  it('no renderiza nada si no hay main ni images', () => {
    const { container } = render(<PropertyPreview main={null} images={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renderiza la imagen principal y las imágenes adicionales', () => {
    render(<PropertyPreview main={stringImage} images={[fileImage]} />);

    const imgs = screen.getAllByRole('img');
    expect(imgs).toHaveLength(2);
    expect(imgs[0]).toHaveAttribute('src', stringImage);
    expect(imgs[1]).toHaveAttribute('src', 'mocked-object-url');
    expect(screen.getByText('Principal')).toBeInTheDocument();
  });

  it('muestra botón de eliminar y llama a onDelete al clickear', () => {
    const onDelete = vi.fn();

    render(<PropertyPreview main={stringImage} images={[fileImage]} onDelete={onDelete} />);

    const buttons = screen.getAllByRole('button', { name: /eliminar/i });
    expect(buttons.length).toBeGreaterThanOrEqual(1);

    fireEvent.click(buttons[0]);
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(stringImage);
  });
});
