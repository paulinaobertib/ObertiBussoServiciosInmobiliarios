import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

import { CommissionPaymentType, CommissionStatus } from '../../../types/commission';

vi.mock('@mui/material/styles', () => ({}));

vi.mock('@mui/material', () => {
  return {
    Box: (p: any) => <div data-testid={p['data-testid'] ?? 'box'} {...p} />,
    Grid: (p: any) => <div data-testid={p['data-testid'] ?? 'grid'} {...p} />,
    TextField: (props: any) => {
      const {
        label,
        value = '',
        onChange,
        disabled,
        multiline,
        type = 'text',
      } = props;

      const common = {
        'aria-label': label,
        value,
        onChange,
        disabled,
      };

      if (multiline) {
        return <textarea {...common as any} />;
      }
      return <input type={type} {...common} />;
    },
    MenuItem: (p: any) => <div data-testid="menu-item" {...p} />,
  };
});

vi.mock('@mui/lab', () => ({
  LoadingButton: (props: any) => (
    <button type="button" onClick={props.onClick}>
      {props.children}
    </button>
  ),
}));

const showAlert = vi.fn();
vi.mock('../../../../shared/context/AlertContext', () => ({
  useGlobalAlert: () => ({ showAlert }),
}));

const postCommission = vi.fn(async (x) => ({ ok: true, data: x }));
const putCommission = vi.fn(async (x) => ({ ok: true, data: x }));
const deleteCommission = vi.fn(async (x) => ({ ok: true, data: x }));
vi.mock('../../../services/commission.service', () => ({
  postCommission: (x: any) => postCommission(x),
  putCommission: (x: any) => putCommission(x),
  deleteCommission: (x: any) => deleteCommission(x),
}));

import { CommissionForm } from '../../../components/commission/CommissionForm';

beforeEach(() => {
  showAlert.mockClear();
  postCommission.mockClear();
  putCommission.mockClear();
  deleteCommission.mockClear();
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const fillCommonFields = () => {
  fireEvent.change(screen.getByLabelText('Monto total'), { target: { value: '1234' } });
  fireEvent.change(screen.getByLabelText('Moneda'), { target: { value: 'USD' } });
  fireEvent.change(screen.getByLabelText('Fecha de Pago'), { target: { value: '2025-09-10' } });
  fireEvent.change(screen.getByLabelText('Estado de pago'), { target: { value: CommissionStatus.PENDIENTE } });
};

describe('CommissionForm', () => {
  it('ADD válido (COMPLETO): arma payload correcto e invoca postCommission; onSuccess y success alert', async () => {
    const onSuccess = vi.fn();

    render(
      <CommissionForm
        action="add"
        contractId={99}
        onSuccess={onSuccess}
      />
    );

    fillCommonFields();

    fireEvent.change(screen.getByLabelText('Tipo de pago'), { target: { value: CommissionPaymentType.COMPLETO } });
    fireEvent.change(screen.getByLabelText('Notas'), { target: { value: 'mi nota' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
    await Promise.resolve();

    expect(postCommission).toHaveBeenCalledTimes(1);
    const payload = postCommission.mock.calls[0][0];
    expect(payload).toMatchObject({
      currency: 'USD',
      totalAmount: 1234,
      date: '2025-09-10',
      paymentType: CommissionPaymentType.COMPLETO,
      installments: 1,
      status: CommissionStatus.PENDIENTE,
      note: 'mi nota',
      contractId: 99,
    });

    expect(showAlert).toHaveBeenCalledWith('Comisión creada correctamente.', 'success');
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('Validación: si faltan campos requeridos muestra warning y no llama servicios', () => {
    render(<CommissionForm action="add" contractId={0 as any} />);

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

    expect(showAlert).toHaveBeenCalledWith('Completa los campos obligatorios', 'warning');
    expect(postCommission).not.toHaveBeenCalled();
    expect(putCommission).not.toHaveBeenCalled();
    expect(deleteCommission).not.toHaveBeenCalled();
  });

  it('ADD con error del servicio: muestra error alert', async () => {
    const err = new Error('falló add');
    postCommission.mockImplementationOnce(async () => { throw err; });

    render(<CommissionForm action="add" contractId={77} />);

    fillCommonFields();
    fireEvent.change(screen.getByLabelText('Tipo de pago'), { target: { value: CommissionPaymentType.COMPLETO } });

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
    await Promise.resolve();

    expect(showAlert).toHaveBeenCalledWith('falló add', 'error');
  });

  it('EDIT precarga item (CUOTAS) y guarda con installments custom (>1)', async () => {
    const item = {
      id: 5,
      currency: 'ARS',
      totalAmount: 500,
      date: '2025-09-11T12:00:00Z',
      paymentType: CommissionPaymentType.CUOTAS,
      installments: 6,
      status: CommissionStatus.PARCIAL,
      note: 'nota x',
      contractId: 40,
    };

    const onSuccess = vi.fn();

    render(<CommissionForm action="edit" item={item as any} onSuccess={onSuccess} />);

    fireEvent.change(screen.getByLabelText('Fecha de Pago'), { target: { value: '2025-09-11' } });
    fireEvent.change(screen.getByLabelText('Monto total'), { target: { value: '600' } });
    fireEvent.change(screen.getByLabelText('Moneda'), { target: { value: 'USD' } });
    fireEvent.change(screen.getByLabelText('Estado de pago'), { target: { value: CommissionStatus.PARCIAL } });
    fireEvent.change(screen.getByLabelText('Tipo de pago'), { target: { value: CommissionPaymentType.CUOTAS } });
    fireEvent.change(screen.getByLabelText('Cuotas'), { target: { value: '8' } });
    fireEvent.change(screen.getByLabelText('Notas'), { target: { value: 'editado' } });

    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    await Promise.resolve();

    expect(putCommission).toHaveBeenCalledTimes(1);
    const sent = putCommission.mock.calls[0][0];
    expect(sent).toMatchObject({
      id: 5,
      currency: 'USD',
      totalAmount: 600,
      date: '2025-09-11',
      paymentType: CommissionPaymentType.CUOTAS,
      installments: 8,
      status: CommissionStatus.PARCIAL,
      note: 'editado',
      contractId: 40,
    });

    expect(showAlert).toHaveBeenCalledWith('Comisión actualizada correctamente.', 'success');
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('DELETE exitoso: llama deleteCommission con id y muestra success', async () => {
    const item = {
      id: 9,
      currency: 'USD',
      totalAmount: 1,
      date: '2025-01-01',
      paymentType: CommissionPaymentType.COMPLETO,
      installments: 1,
      status: CommissionStatus.PENDIENTE,
      note: '',
      contractId: 10,
    };

    const onSuccess = vi.fn();
    render(<CommissionForm action="delete" item={item as any} onSuccess={onSuccess} />);

    // Botón dice "Eliminar" (por nuestro mock no validamos disabled)
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));
    await Promise.resolve();

    expect(deleteCommission).toHaveBeenCalledWith(9);
    expect(showAlert).toHaveBeenCalledWith('Comisión eliminada con éxito.', 'success');
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('DELETE sin id lanza error y muestra alert de error', async () => {
    render(<CommissionForm action="delete" item={{} as any} />);

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));
    await Promise.resolve();

    expect(deleteCommission).not.toHaveBeenCalled();
    expect(showAlert).toHaveBeenCalledWith('Falta el ID para eliminar.', 'error');
  });

  it('Cambiar a COMPLETO fuerza installments=1 y deshabilita el campo (lógica de cálculo)', () => {
    render(<CommissionForm action="add" contractId={123} />);

    fillCommonFields();
    fireEvent.change(screen.getByLabelText('Tipo de pago'), { target: { value: CommissionPaymentType.CUOTAS } });
    fireEvent.change(screen.getByLabelText('Cuotas'), { target: { value: '5' } });

    fireEvent.change(screen.getByLabelText('Tipo de pago'), { target: { value: CommissionPaymentType.COMPLETO } });

    expect((screen.getByLabelText('Cuotas') as HTMLInputElement).value).toBe('1');
  });

  it('Validación específica de CUOTAS: installments=0 ⇒ warning', () => {
    render(<CommissionForm action="add" contractId={55} />);

    fillCommonFields();
    fireEvent.change(screen.getByLabelText('Tipo de pago'), { target: { value: CommissionPaymentType.CUOTAS } });
    fireEvent.change(screen.getByLabelText('Cuotas'), { target: { value: '0' } });

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
    expect(showAlert).toHaveBeenCalledWith('Completa los campos obligatorios', 'warning');
    expect(postCommission).not.toHaveBeenCalled();
  });

it('EDIT sin id dispara error "Falta el ID para editar."', async () => {

    const item = {
        currency: 'USD',
        totalAmount: 1,
        date: '2025-01-01',
        paymentType: CommissionPaymentType.COMPLETO,
        installments: 1,
        status: CommissionStatus.PENDIENTE,
        note: '',
        contractId: 10,
    } as any;

    render(<CommissionForm action="edit" item={item} contractId={10} />);

    fireEvent.change(screen.getByLabelText('Monto total'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Moneda'), { target: { value: 'USD' } });
    fireEvent.change(screen.getByLabelText('Fecha de Pago'), { target: { value: '2025-01-01' } });
    fireEvent.change(screen.getByLabelText('Estado de pago'), { target: { value: CommissionStatus.PENDIENTE } });
    fireEvent.change(screen.getByLabelText('Tipo de pago'), { target: { value: CommissionPaymentType.COMPLETO } });

    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    await Promise.resolve();

    expect(putCommission).not.toHaveBeenCalled();
    expect(showAlert).toHaveBeenCalledWith('Falta el ID para editar.', 'error');
});

});
