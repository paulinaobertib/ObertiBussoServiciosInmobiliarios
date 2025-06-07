import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import CategoryButton from '../../components/CategoryButton';

const mockPickItem = vi.fn();
let mockCurrentCategory: string | null = null;

vi.mock('../../context/PropertiesContext', () => ({
  usePropertyCrud: () => ({
    pickItem: mockPickItem,
    currentCategory: mockCurrentCategory,
  }),
}));

vi.mock('../../utils/translate', () => ({
  translate: (key: string) => `Translated(${key})`,
}));

describe('CategoryButton', () => {
  beforeEach(() => {
    mockPickItem.mockClear();
    mockCurrentCategory = null;
  });

  it('renderiza el botón con texto traducido', () => {
    render(<CategoryButton category="owner" />);
    expect(screen.getByRole('button', { name: 'Translated(owner)' })).toBeInTheDocument();
  });

  it('usa "contained" si la categoría está activa', () => {
    mockCurrentCategory = 'owner';
    render(<CategoryButton category="owner" />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('MuiButton-contained'); // Clase MUI para botón activo
  });

  it('usa "outlined" si la categoría no está activa', () => {
    mockCurrentCategory = 'type';
    render(<CategoryButton category="owner" />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('MuiButton-outlined'); // Clase MUI para botón inactivo
  });

  it('llama a pickItem con null si ya está activa', () => {
    mockCurrentCategory = 'owner';
    render(<CategoryButton category="owner" />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockPickItem).toHaveBeenCalledWith('category', null);
  });

  it('llama a pickItem con la categoría si no está activa', () => {
    mockCurrentCategory = 'type';
    render(<CategoryButton category="owner" />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockPickItem).toHaveBeenCalledWith('category', 'owner');
  });
});
