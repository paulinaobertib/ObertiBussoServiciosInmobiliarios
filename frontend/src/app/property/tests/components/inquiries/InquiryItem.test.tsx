/// <reference types="vitest" />
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { MemoryRouter } from 'react-router-dom';
import { InquiryItem } from '../../../components/inquiries/InquiryItem';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return { ...actual, useNavigate: vi.fn() };
});

vi.mock('../../../../user/context/AuthContext', () => ({
  useAuthContext: vi.fn(),
}));

vi.mock('../../../hooks/useInquiries', () => ({
  useInquiries: vi.fn(),
}));

vi.mock('../../../utils/findPropertyIdByTitle', () => ({
  findPropertyIdByTitle: vi.fn(),
}));

vi.mock('../../../../../lib', () => ({
  buildRoute: vi.fn((id: number) => `/prop/${id}`),
  ROUTES: { PROPERTY_DETAILS: '/property/:id' },
}));

vi.mock('@mui/material', async () => {
  const actual = await vi.importActual<any>('@mui/material');
  return { ...actual, useMediaQuery: vi.fn() };
});

// --- helpers ---
const theme = createTheme();
function renderWithProviders(ui: React.ReactElement) {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>{ui}</MemoryRouter>
    </ThemeProvider>
  );
}

// --- shortcuts a los mocks ---
import { useAuthContext as _useAuthContext } from '../../../../user/context/AuthContext';
import { useInquiries as _useInquiries } from '../../../hooks/useInquiries';
import { findPropertyIdByTitle as _findPropertyIdByTitle } from '../../../utils/findPropertyIdByTitle';
import { useNavigate as _useNavigate } from 'react-router-dom';
import { useMediaQuery as _useMediaQuery } from '@mui/material';

const useAuthContext = _useAuthContext as unknown as ReturnType<typeof vi.fn>;
const useInquiries = _useInquiries as unknown as ReturnType<typeof vi.fn>;
const findPropertyIdByTitle = _findPropertyIdByTitle as unknown as ReturnType<typeof vi.fn>;
const useNavigate = _useNavigate as unknown as ReturnType<typeof vi.fn>;
const useMediaQuery = _useMediaQuery as unknown as ReturnType<typeof vi.fn>;

// ---- data base ----
const baseInquiry = {
  id: 7,
  firstName: 'Ana',
  lastName: 'Pérez',
  email: 'ana@example.com',
  phone: '3511234567',
  title: 'Consulta sobre alquiler',
  description: '¿Sigue disponible?',
  date: '2025-08-01T14:30:00',
  dateClose: null as string | null,
  status: 'ABIERTA',
  propertyTitles: ['Depto 2D Centro', 'Cabaña Lago'],
};

const properties = [
  { id: 11, title: 'Depto 2D Centro' },
  { id: 22, title: 'Cabaña Lago' },
];

// ---- reset por test ----
beforeEach(() => {
  vi.clearAllMocks();
  useInquiries.mockReturnValue({ properties });
  useNavigate.mockReturnValue(vi.fn());
  useMediaQuery.mockReturnValue(false); // desktop
  useAuthContext.mockReturnValue({ isAdmin: false }); // no admin
  findPropertyIdByTitle.mockImplementation((title: string, list: any[]) => {
    const hit = list.find((p) => p.title === title);
    return hit?.id ?? null;
  });
});

afterEach(() => vi.clearAllMocks());

// ---- tests ----
describe('InquiryItem', () => {
  it('muestra info básica para usuario NO admin (desktop)', () => {
    renderWithProviders(
      <InquiryItem inquiry={baseInquiry as any} loading={false} onResolve={vi.fn()} />
    );

    expect(screen.getByText(/Fecha de envío:/i)).toBeInTheDocument();
    expect(screen.getByText(/Fecha de cierre:/i)).toBeInTheDocument();
    expect(screen.getByText('Descripción')).toBeInTheDocument();
    expect(screen.getByText(baseInquiry.description)).toBeInTheDocument();

    // Solución para texto dividido en varios nodos
    const userElement = screen.getByText(/Usuario:/i).closest('p');
    expect(userElement).toHaveTextContent('Usuario: Ana Pérez');

    const emailElement = screen.getByText(/Email:/i).closest('p');
    expect(emailElement).toHaveTextContent(baseInquiry.email);

    const phoneElement = screen.getByText(/Teléfono:/i).closest('p');
    expect(phoneElement).toHaveTextContent(baseInquiry.phone);
  });

  it('como ADMIN muestra PropertyInfo con chips y botón "Marcar resuelta"', () => {
    useAuthContext.mockReturnValue({ isAdmin: true });
    const onResolve = vi.fn();
    const navigate = vi.fn();
    useNavigate.mockReturnValue(navigate);

    renderWithProviders(
      <InquiryItem inquiry={baseInquiry as any} loading={false} onResolve={onResolve} />
    );

    const chip1 = screen.getByRole('button', { name: 'Depto 2D Centro' });
    fireEvent.click(chip1);
    expect(navigate).toHaveBeenCalled();

    const action = screen.getByRole('button', { name: /Marcar resuelta/i });
    fireEvent.click(action);
    expect(onResolve).toHaveBeenCalledWith(7);
  });

    it('Admin con loading=true muestra LoadingButton en estado cargando', () => {
    useAuthContext.mockReturnValue({ isAdmin: true });
    renderWithProviders(
        <InquiryItem inquiry={baseInquiry as any} loading={true} onResolve={vi.fn()} />
    );

    const action = screen.getByRole('button', { name: /Marcar resuelta/i });
    // Verifica que tenga la clase de estado cargando
    expect(action).toHaveClass('MuiButton-loading');
    });

  it('si la consulta está CERRADA, el botón aparece deshabilitado con texto "Resuelta"', () => {
    useAuthContext.mockReturnValue({ isAdmin: true });
    const closedInquiry = { ...baseInquiry, status: 'CERRADA', dateClose: '2025-08-10T09:15:00' };

    renderWithProviders(
      <InquiryItem inquiry={closedInquiry as any} loading={false} onResolve={vi.fn()} />
    );

    const disabledBtn = screen.getByRole('button', { name: /Resuelta/i });
    expect(disabledBtn).toBeDisabled();
  });

  it('cuando propertyTitles está vacío muestra "Consulta general"', () => {
    useAuthContext.mockReturnValue({ isAdmin: true });
    const genInquiry = { ...baseInquiry, propertyTitles: [] };

    renderWithProviders(
      <InquiryItem inquiry={genInquiry as any} loading={false} onResolve={vi.fn()} />
    );

    expect(screen.getByText(/Consulta general/i)).toBeInTheDocument();
  });
});
