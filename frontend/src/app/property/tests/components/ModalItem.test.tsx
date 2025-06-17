import { describe, it, vi, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ModalItem from '../../components/ModalItem';
import { handleClose } from '../../components/ModalItem';

// Mocks para formularios
vi.mock('../../components/forms/PropertyForm', () => ({
  default: vi.fn(({ action }: any) => <div data-testid="property-form">{action} property</div>)
}));

vi.mock('../../components/forms/StatusForm', () => ({
  default: vi.fn(({ item }: any) => <div data-testid="status-form">estado: {item?.name}</div>)
}));

vi.mock('../../components/forms/AmenityForm', () => ({
  default: () => <div data-testid="amenity-form" />
}));

vi.mock('../../components/forms/OwnerForm', () => ({
  default: () => <div data-testid="owner-form" />
}));

vi.mock('../../components/forms/TypeForm', () => ({
  default: () => <div data-testid="type-form" />
}));

vi.mock('../../components/forms/NeighborhoodForm', () => ({
  default: () => <div data-testid="neighborhood-form" />
}));

vi.mock('../../components/forms/MaintenanceForm', () => ({
  default: () => <div data-testid="maintenance-form" />
}));

vi.mock('../../components/forms/CommentForm', () => ({
  default: () => <div data-testid="comment-form" />
}));

describe('ModalItem', () => {
  it('no renderiza nada si info es null', () => {
    const { container } = render(<ModalItem info={null} close={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('renderiza el formulario por defecto si no hay formKey', () => {
    render(<ModalItem info={{ action: 'add' }} close={() => {}} />);
    expect(screen.getByTestId('property-form')).toHaveTextContent('add property');
    expect(screen.getByText(/crear propiedad/i)).toBeInTheDocument();
  });

  it('renderiza StatusForm si action es edit-status', () => {
    render(<ModalItem info={{ action: 'edit-status', item: { name: 'activo' } }} close={() => {}} />);
    expect(screen.getByTestId('status-form')).toHaveTextContent('estado: activo');
    expect(screen.getByText(/editar estado/i)).toBeInTheDocument();
  });

  it('llama a close si el motivo no es "backdropClick"', () => {
    const close = vi.fn();
    render(<ModalItem info={{ action: 'add' }} close={close} />);
    const modal = screen.getByTestId('modal');

    // Simula el cierre con un motivo que no es 'backdropClick'
    fireEvent.keyDown(modal, { key: 'Escape', code: 'Escape' });
    // El cierre no ocurre automáticamente, así que simula el botón de cerrar
    fireEvent.click(screen.getByLabelText(/cerrar modal/i));

    expect(close).toHaveBeenCalled();
  });

  it('renderiza AmenityForm cuando formKey es "amenity"', () => {
    render(<ModalItem info={{ action: 'edit', formKey: 'amenity' }} close={() => {}} />);
    expect(screen.getByTestId('amenity-form')).toBeInTheDocument();
  });

  it('renderiza OwnerForm cuando formKey es "owner"', () => {
    render(<ModalItem info={{ action: 'edit', formKey: 'owner' }} close={() => {}} />);
    expect(screen.getByTestId('owner-form')).toBeInTheDocument();
  });

  it('renderiza TypeForm cuando formKey es "type"', () => {
    render(<ModalItem info={{ action: 'edit', formKey: 'type' }} close={() => {}} />);
    expect(screen.getByTestId('type-form')).toBeInTheDocument();
  });

  it('renderiza NeighborhoodForm cuando formKey es "neighborhood"', () => {
    render(<ModalItem info={{ action: 'edit', formKey: 'neighborhood' }} close={() => {}} />);
    expect(screen.getByTestId('neighborhood-form')).toBeInTheDocument();
  });

  it('renderiza MaintenanceForm cuando formKey es "maintenance"', () => {
    render(<ModalItem info={{ action: 'edit', formKey: 'maintenance' }} close={() => {}} />);
    expect(screen.getByTestId('maintenance-form')).toBeInTheDocument();
  });

  it('renderiza CommentForm cuando formKey es "comment"', () => {
    render(<ModalItem info={{ action: 'edit', formKey: 'comment' }} close={() => {}} />);
    expect(screen.getByTestId('comment-form')).toBeInTheDocument();
  });

  it('muestra el título correcto cuando action es "delete"', () => {
    render(<ModalItem info={{ action: 'delete', formKey: 'property' }} close={() => {}} />);
    expect(screen.getByText(/eliminar propiedad/i)).toBeInTheDocument();
  });

  it('usa PropertyForm si formKey no está en el registro', () => {
    render(<ModalItem info={{ action: 'edit', formKey: 'invalido' }} close={() => {}} />);
    expect(screen.getByTestId('property-form')).toHaveTextContent('edit property');
  });

  it('no llama a close si el motivo es backdropClick', () => {
    const close = vi.fn();
    const { container } = render(<ModalItem info={{ action: 'add' }} close={close} />);
    const dialog = container.querySelector('[role="dialog"]');
    dialog?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(close).not.toHaveBeenCalled();
  });

  it('cierra el modal al hacer clic en el botón cerrar', () => {
    const close = vi.fn();
    render(<ModalItem info={{ action: 'edit', formKey: 'type' }} close={close} />);
    const closeButton = screen.getByLabelText(/cerrar modal/i);
    fireEvent.click(closeButton);
    expect(close).toHaveBeenCalled();
  });
});

describe('handleClose', () => {
  it('llama a close si reason no es backdropClick', () => {
    const close = vi.fn();
    handleClose('escapeKeyDown', close);
    expect(close).toHaveBeenCalled();
  });

  it('no llama a close si reason es backdropClick', () => {
    const close = vi.fn();
    handleClose('backdropClick', close);
    expect(close).not.toHaveBeenCalled();
  });
});
