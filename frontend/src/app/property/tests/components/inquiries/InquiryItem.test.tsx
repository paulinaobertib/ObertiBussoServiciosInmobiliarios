import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { InquiryItem } from '../../../components/inquiries/InquiryItem';

const CREATED_ISO = '2025-01-15T15:30:00';
const CLOSED_ISO = '2025-01-20T10:10:00';

vi.mock('dayjs', () => {
  const factory = (input?: string) => ({
    _input: input,
    locale: vi.fn().mockReturnThis(),
    format: vi.fn(() => {
      if (input === CREATED_ISO) return 'CREATED_FMT';
      if (input === CLOSED_ISO) return 'CLOSED_FMT';
      return 'DATE_FMT';
    }),
  });
  return { default: factory };
});
vi.mock('dayjs/locale/es', () => ({}));

vi.mock('@mui/lab', () => ({
  LoadingButton: ({ children, loading, disabled, onClick, ...rest }: any) => (
    <button
      disabled={Boolean(loading) || Boolean(disabled)}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  ),
}));

let IS_MOBILE = false;
vi.mock('@mui/material', async () => {
  const actual: any = await vi.importActual('@mui/material');
  return {
    ...actual,
    useMediaQuery: vi.fn(() => IS_MOBILE),
  };
});

vi.mock('../../../../user/context/AuthContext', () => ({
  useAuthContext: vi.fn(() => ({ isAdmin: false })),
}));
import { useAuthContext } from '../../../../user/context/AuthContext';

let navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual: any = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});
vi.mock('../../../../lib', () => ({
  buildRoute: (_route: string, id: number) => `/prop/${id}`,
  ROUTES: { PROPERTY_DETAILS: '/prop/:id' },
}));

vi.mock('../../utils/findPropertyIdByTitle', () => ({
  findPropertyIdByTitle: (title: string, properties: { id: number; title: string }[]) =>
    properties.find((p) => p.title === title)?.id,
}));

const renderUI = (props: any) =>
  render(
    <ThemeProvider theme={createTheme()}>
      <InquiryItem {...props} />
    </ThemeProvider>
  );

const baseInquiry = (overrides: Partial<any> = {}): any => ({
  id: 99,
  phone: '123',
  email: 'ana@example.com',
  firstName: 'Ana',
  lastName: 'García',
  date: CREATED_ISO,
  title: 'Consulta X',
  description: 'Texto de la consulta',
  status: 'ABIERTA',
  dateClose: CLOSED_ISO,
  propertyTitles: ['Casa 1', 'NoMatch'],
  ...overrides,
});

const propsBase = (overrides: Partial<any> = {}) => ({
  inquiry: baseInquiry(),
  loading: false,
  onResolve: vi.fn(),
  properties: [
    { id: 1, title: 'Casa 1' },
    { id: 2, title: 'Depto 2' },
  ],
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
  IS_MOBILE = false;
  navigateMock = vi.fn();
  (useAuthContext as unknown as Mock).mockReturnValue({ isAdmin: false });
});

describe('InquiryItem', () => {
  it('no-admin (desktop): muestra fechas, descripción, estado y datos de contacto; no muestra UI de admin', () => {
    IS_MOBILE = false;
    (useAuthContext as unknown as Mock).mockReturnValue({ isAdmin: false });

    renderUI(propsBase());

    expect(screen.getByText(/Fecha de envío:/)).toBeInTheDocument();
    expect(screen.getByText('CREATED_FMT')).toBeInTheDocument();
    expect(screen.getByText(/Fecha de cierre:/)).toBeInTheDocument();
    expect(screen.getByText('CLOSED_FMT')).toBeInTheDocument();

    expect(screen.getByText('Descripción')).toBeInTheDocument();
    expect(screen.getByText('Texto de la consulta')).toBeInTheDocument();

    expect(screen.getByText('Abierta')).toBeInTheDocument();

    expect(screen.getByText(/Usuario:/)).toBeInTheDocument();
    expect(screen.getByText(/Ana García/)).toBeInTheDocument();
    expect(screen.getByText(/Email:/)).toBeInTheDocument();
    expect(screen.getByText('ana@example.com')).toBeInTheDocument();
    expect(screen.getByText(/Teléfono:/)).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();

    expect(screen.queryByText('Marcar resuelta')).not.toBeInTheDocument();
    expect(screen.queryByText('Consulta general')).not.toBeInTheDocument();
  });

  it('admin (desktop): muestra "Consulta general" si no hay títulos y permite resolver', () => {
    (useAuthContext as unknown as Mock).mockReturnValue({ isAdmin: true });

    const onResolve = vi.fn();
    const props = propsBase({
      inquiry: baseInquiry({ propertyTitles: [] }),
      onResolve,
    });

    renderUI(props);

    expect(screen.getByText('Consulta X')).toBeInTheDocument();
    expect(screen.getByText('Consulta general')).toBeInTheDocument();

    const btnNode = screen.getByText('Marcar resuelta');
    const btnEl = btnNode.closest('button') ?? btnNode;
    expect((btnEl as HTMLButtonElement).disabled).toBe(false);

    fireEvent.click(btnEl!);
    expect(onResolve).toHaveBeenCalledTimes(1);
    expect(onResolve).toHaveBeenCalledWith(99);
  });

  it('admin (desktop): con múltiples títulos navega al click en chip clicable y no navega en chip sin id', async () => {
    (useAuthContext as unknown as Mock).mockReturnValue({ isAdmin: true });

    renderUI(propsBase());

    const user = userEvent.setup();

    // Tomamos el root del Chip (clase MUI) para asegurar el onClick
    const chipLabel = screen.getByText('Casa 1');
    const chipRoot = chipLabel.closest('[class*="MuiChip-root"]') as HTMLElement || chipLabel;

    await user.click(chipRoot);

    expect(navigateMock).toHaveBeenCalledTimes(1);
    // Por si tu buildRoute agrega algo más, validamos que contenga la ruta
    expect(navigateMock).toHaveBeenCalledWith('/properties/1');

    // Título sin id: no debe navegar
    const nonClickable = screen.getByText('NoMatch');
    await user.click(nonClickable);
    expect(navigateMock).toHaveBeenCalledTimes(1);
  });

  it('admin: si la consulta está CERRADA muestra botón "Resuelta" deshabilitado y no dispara onResolve', () => {
    (useAuthContext as unknown as Mock).mockReturnValue({ isAdmin: true });

    const onResolve = vi.fn();
    renderUI(
      propsBase({
        inquiry: baseInquiry({ status: 'CERRADA' }),
        onResolve,
      })
    );

    const btnNode = screen.getByText('Resuelta');
    const btnEl = btnNode.closest('button') ?? btnNode;
    expect((btnEl as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(btnEl!);
    expect(onResolve).not.toHaveBeenCalled();
  });

  it('admin: botón "Marcar resuelta" se deshabilita mientras loading=true', () => {
    (useAuthContext as unknown as Mock).mockReturnValue({ isAdmin: true });

    renderUI(
      propsBase({
        loading: true,
      })
    );

    const btnNode = screen.getByText('Marcar resuelta');
    const btnEl = btnNode.closest('button') ?? btnNode;
    expect((btnEl as HTMLButtonElement).disabled).toBe(true);
  });

  it('no-admin (mobile): respeta layout móvil y muestra chip de estado', () => {
    IS_MOBILE = true;
    (useAuthContext as unknown as Mock).mockReturnValue({ isAdmin: false });

    renderUI(propsBase());

    expect(screen.getByText('CREATED_FMT')).toBeInTheDocument();
    expect(screen.getByText('CLOSED_FMT')).toBeInTheDocument();
    expect(screen.getByText('Abierta')).toBeInTheDocument();

    expect(screen.queryByText('Marcar resuelta')).not.toBeInTheDocument();
    expect(screen.queryByText('Consulta general')).not.toBeInTheDocument();
  });
});
