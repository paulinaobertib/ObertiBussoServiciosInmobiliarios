import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Footer from '../../components/Footer';
import { MemoryRouter } from 'react-router-dom';
import { ROUTES } from '../../../../lib';

const mockNavigate = vi.fn();

// Mock del hook useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Footer', () => {
  const originalOpen = window.open;

  beforeEach(() => {
    vi.clearAllMocks();
    window.open = vi.fn();
  });

  afterEach(() => {
    window.open = originalOpen;
  });

  const setup = () => {
    return render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );
  };

  it('muestra secciones principales', () => {
    setup();
    expect(screen.getByText('Accesos')).toBeInTheDocument();
    expect(screen.getByText('Redes y Contacto')).toBeInTheDocument();
    expect(screen.getByText('Ubicación de Oficinas')).toBeInTheDocument();
  });

  it('muestra el año actual en el pie de página', () => {
    setup();
    const year = new Date().getFullYear();
    expect(screen.getByText(`© ${year} Oberti Busso Servicios Inmobiliarios. Todos los derechos reservados.`)).toBeInTheDocument();
  });

  // --- Rutas internas ---
  it('navega a Inicio al hacer clic en el botón', () => {
    setup();
    fireEvent.click(screen.getByText('Inicio'));
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.HOME_APP);
  });

  it('navega a Generar Consulta al hacer clic en el botón', () => {
    setup();
    fireEvent.click(screen.getByText('Generar Consulta'));
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.CONTACT);
  });

  it('navega a Noticias al hacer clic en el botón', () => {
    setup();
    fireEvent.click(screen.getByText('Noticias'));
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.NEWS);
  });

  it('navega a Políticas de Privacidad al hacer clic en el botón', () => {
    setup();
    fireEvent.click(screen.getByText('Políticas de Privacidad'));
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.POLICIES);
  });

  // --- Enlaces externos ---
  it('abre Facebook al hacer clic en el ícono', () => {
    setup();
    fireEvent.click(screen.getByLabelText('Facebook'));
    expect(window.open).toHaveBeenCalledWith(
      'https://www.facebook.com/oberti.busso/',
      '_blank'
    );
  });

  it('abre Instagram al hacer clic en el ícono', () => {
    setup();
    fireEvent.click(screen.getByLabelText('Instagram'));
    expect(window.open).toHaveBeenCalledWith(
      'https://www.instagram.com/oberti.busso/',
      '_blank'
    );
  });

  it('abre WhatsApp Pablo al hacer clic en el ícono', () => {
    setup();
    fireEvent.click(screen.getByLabelText('WhatsApp Pablo'));
    expect(window.open).toHaveBeenCalledWith(
      'https://wa.me/5493513264536',
      '_blank'
    );
  });

  it('abre WhatsApp Luis al hacer clic en el ícono', () => {
    setup();
    fireEvent.click(screen.getByLabelText('WhatsApp Luis'));
    expect(window.open).toHaveBeenCalledWith(
      'https://wa.me/5493515107888',
      '_blank'
    );
  });

  it('abre Facebook al hacer clic en el texto "Facebook"', () => {
    setup();
    fireEvent.click(screen.getByText('Facebook'));
    expect(window.open).toHaveBeenCalledWith(
      'https://www.facebook.com/oberti.busso/',
      '_blank'
    );
  });

  it('abre Instagram al hacer clic en el texto "Instagram"', () => {
    setup();
    fireEvent.click(screen.getByText('Instagram'));
    expect(window.open).toHaveBeenCalledWith(
      'https://www.instagram.com/oberti.busso/',
      '_blank'
    );
  });

  it('abre WhatsApp Pablo al hacer clic en el texto del número', () => {
    setup();
    fireEvent.click(screen.getByText('Luis: +54 9 351 3264536'));
    expect(window.open).toHaveBeenCalledWith(
      'https://wa.me/5493513264536',
      '_blank'
    );
  });

  it('abre WhatsApp Luis al hacer clic en el texto del número', () => {
    setup();
    fireEvent.click(screen.getByText('Pablo: +54 9 351 5107888'));
    expect(window.open).toHaveBeenCalledWith(
      'https://wa.me/5493515107888',
      '_blank'
    );
  });
});
