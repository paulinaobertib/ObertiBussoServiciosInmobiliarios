import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import NavBar from '../../components/Navbar';
import { ROUTES } from '../../../../lib';
import { within } from '@testing-library/react';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockClearComparison = vi.fn();
vi.mock('../../context/PropertiesContext', async () => {
  const actual = await vi.importActual('../../context/PropertiesContext');
  return {
    ...actual,
    usePropertyCrud: () => ({
      clearComparison: mockClearComparison,
    }),
  };
});

describe('NavBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderNavBar = () =>
    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    );

  it('renderiza botones del menú', () => {
    renderNavBar();
    expect(screen.getByText(/CONTACTO/i)).toBeInTheDocument();
    expect(screen.getByText(/NOTICIAS/i)).toBeInTheDocument();
  });

  it('navega al hacer clic en botones de menú', () => {
    renderNavBar();
    fireEvent.click(screen.getByText(/CONTACTO/i));
    expect(mockNavigate).toHaveBeenCalledWith('/contact');
  });

  it('abre y cierra el menú mobile', () => {
    renderNavBar();

    const menuButton = screen.getByLabelText(/open menu/i);
    fireEvent.click(menuButton);

    const menu = screen.getByRole('menu'); 
    const contactoItem = within(menu).getByText(/CONTACTO/i);
    fireEvent.click(contactoItem);

    expect(mockNavigate).toHaveBeenCalledWith('/contact');
  });

  it('click en logo llama clearComparison y navega al home', () => {
    renderNavBar();
    const logo = screen.getAllByAltText(/logo/i)[0];
    fireEvent.click(logo);
    expect(mockClearComparison).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.HOME_APP);
  });

  it('navega al panel de admin desde ícono de perfil', () => {
    renderNavBar();
    fireEvent.click(screen.getByLabelText(/profile/i));
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.ADMIN_PANEL);
  });
});
