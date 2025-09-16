/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { PaymentsList } from '../../../components/payments/PaymentsList';
import { Payment, PaymentCurrency, PaymentConcept } from '../../../types/payment';
import { PaymentItem } from '../../../components/payments/PaymentItem';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// --- Mock PaymentItem para controlar llamadas a onEdit/onDelete ---
vi.mock('../../../components/payments/PaymentItem', () => ({
  PaymentItem: vi.fn(() => <div data-testid="payment-item" />),
}));

// --- Custom theme ---
const customTheme = createTheme({
  palette: {
    quaternary: { main: '#f0f0f0' } as any,
  },
});

const renderWithTheme = (ui: React.ReactNode) =>
  render(<ThemeProvider theme={customTheme}>{ui}</ThemeProvider>);

describe('PaymentsList', () => {
  const payments: Payment[] = [
    {
      id: 1,
      description: 'Pago 1',
      amount: 1000,
      paymentCurrency: PaymentCurrency.ARS,
      date: '2025-09-01T00:00:00Z',
      concept: PaymentConcept.ALQUILER,
      contractId: 10,
    },
    {
      id: 2,
      description: 'Pago 2',
      amount: 2000,
      paymentCurrency: PaymentCurrency.USD,
      date: '2025-09-15T00:00:00Z',
      concept: PaymentConcept.EXTRA,
      contractId: 11,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra mensaje si no hay pagos', () => {
    renderWithTheme(<PaymentsList payments={[]} />);

    expect(screen.getByText('Sin pagos registrados')).toBeInTheDocument();
  });

  it('renderiza PaymentItem por cada pago', () => {
    renderWithTheme(<PaymentsList payments={payments} />);

    const items = screen.getAllByTestId('payment-item');
    expect(items).toHaveLength(2);
  });

  it('pasa onEdit y onDelete a PaymentItem', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    renderWithTheme(
      <PaymentsList payments={payments} onEdit={onEdit} onDelete={onDelete} />
    );

    // Verificamos que PaymentItem fue llamado con los props correctos
    expect(PaymentItem).toHaveBeenCalledTimes(2);

    const firstCallProps = (PaymentItem as any).mock.calls[0][0];
    const secondCallProps = (PaymentItem as any).mock.calls[1][0];

    expect(firstCallProps.payment).toEqual(payments[0]);
    expect(firstCallProps.onEdit).toBe(onEdit);
    expect(firstCallProps.onDelete).toBe(onDelete);

    expect(secondCallProps.payment).toEqual(payments[1]);
    expect(secondCallProps.onEdit).toBe(onEdit);
    expect(secondCallProps.onDelete).toBe(onDelete);
  });

});
