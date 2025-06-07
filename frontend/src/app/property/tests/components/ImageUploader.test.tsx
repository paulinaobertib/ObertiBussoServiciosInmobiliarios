import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ImageUploader from '../../components/ImageUploader';

describe('ImageUploader', () => {
  it('renderiza el label correctamente', () => {
    render(<ImageUploader label="Sube imágenes" onSelect={() => {}} />);
    expect(screen.getByText('Sube imágenes')).toBeInTheDocument();
  });

    it('input tiene atributo multiple según prop', () => {
    const { container, rerender } = render(<ImageUploader label="Label" onSelect={() => {}} />);
    const input = container.querySelector('input[type="file"]');
    expect(input).not.toHaveAttribute('multiple');

    rerender(<ImageUploader label="Label" multiple onSelect={() => {}} />);
    const input2 = container.querySelector('input[type="file"]');
    expect(input2).toHaveAttribute('multiple');
    });

  it('llama onSelect con solo un archivo si multiple y append son false', () => {
    const onSelect = vi.fn();
    render(<ImageUploader label="Label" onSelect={onSelect} />);

    const file1 = new File(['content'], 'file1.png', { type: 'image/png' });
    const file2 = new File(['content'], 'file2.png', { type: 'image/png' });

    const input = screen.getByLabelText(/label/i) as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file1, file2] } });

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith([file1]); // solo el primero
    expect(input.value).toBe(''); // input limpiado
  });

  it('llama onSelect con todos los archivos si multiple es true y append false', () => {
    const onSelect = vi.fn();
    render(<ImageUploader label="Label" multiple onSelect={onSelect} />);

    const file1 = new File(['content'], 'file1.png', { type: 'image/png' });
    const file2 = new File(['content'], 'file2.png', { type: 'image/png' });

    const input = screen.getByLabelText(/label/i) as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file1, file2] } });

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith([file1, file2]); // todos
    expect(input.value).toBe('');
  });

  it('llama onSelect con todos los archivos si append es true (independientemente de multiple)', () => {
    const onSelect = vi.fn();
    render(<ImageUploader label="Label" append onSelect={onSelect} />);

    const file1 = new File(['content'], 'file1.png', { type: 'image/png' });
    const file2 = new File(['content'], 'file2.png', { type: 'image/png' });

    const input = screen.getByLabelText(/label/i) as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file1, file2] } });

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith([file1, file2]); // todos
    expect(input.value).toBe('');
  });

  it('no llama onSelect si no hay archivos', () => {
    const onSelect = vi.fn();
    render(<ImageUploader label="Label" onSelect={onSelect} />);

    const input = screen.getByLabelText(/label/i) as HTMLInputElement;

    fireEvent.change(input, { target: { files: null } });

    expect(onSelect).not.toHaveBeenCalled();
  });
});
