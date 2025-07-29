import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Spinner } from '../../components/Spinner';

describe('Spinner', () => {
  it('renderiza el spinner correctamente', () => {
    render(<Spinner />);
    const spinner = screen.getByRole('progressbar');
    expect(spinner).toBeInTheDocument();
  });

  it('usa altura automática si no se pasa fullHeight', () => {
    const { container } = render(<Spinner />);
    const box = container.firstChild as HTMLElement;
    expect(box).toHaveStyle('height: auto');
  });

  it('usa height: 100% cuando fullHeight es true', () => {
    const { container } = render(<Spinner fullHeight />);
    const box = container.firstChild as HTMLElement;
    expect(box).toHaveStyle('height: 100%');
  });
});
