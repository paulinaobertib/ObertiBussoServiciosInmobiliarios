import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingBackdrop from '../../../shared/components/Loader';

describe('LoadingBackdrop', () => {
  it('muestra el loader cuando open es true', () => {
    render(<LoadingBackdrop open={true} />);
    // Buscar el Backdrop por testid
    const backdrop = screen.getByTestId('loading-backdrop');
    expect(backdrop).toBeInTheDocument();
    expect(backdrop).toBeVisible();

    // Buscar el CircularProgress por role
    const progress = screen.getByRole('progressbar', { hidden: true });
    expect(progress).toBeInTheDocument();
  });

  it('no muestra el loader cuando open es false', () => {
    render(<LoadingBackdrop open={false} />);
    const backdrop = screen.getByTestId('loading-backdrop');
    // El Backdrop está en el DOM pero no visible (display:none)
    expect(backdrop).not.toBeVisible();
  });
});
