/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Modal, Props } from "../../components/Modal";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// Utilidad para renderizar el modal con theme de MUI
const renderWithTheme = (ui: React.ReactElement) => {
  const theme = createTheme();
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe("Modal", () => {
  const defaultProps: Props = {
    open: true,
    title: "Test Modal",
    onClose: vi.fn(),
    children: <div>Contenido del modal</div>,
  };

  beforeEach(() => {
    (defaultProps.onClose as Mock).mockClear();
  });

  it("renderiza el título y el contenido", () => {
    renderWithTheme(<Modal {...defaultProps} />);
    expect(screen.getByText("Test Modal")).toBeInTheDocument();
    expect(screen.getByText("Contenido del modal")).toBeInTheDocument();
  });

  it("llama a onClose cuando se hace clic en el botón de cerrar", () => {
    renderWithTheme(<Modal {...defaultProps} />);
    fireEvent.click(screen.getByLabelText(/cerrar modal/i));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('llama a onClose al presionar Escape (reason: "escapeKeyDown")', () => {
    const onClose = vi.fn();
    renderWithTheme(<Modal {...defaultProps} onClose={onClose} />);

    const dialog = screen.getByRole("dialog");
    fireEvent.keyDown(dialog, { key: "Escape" });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('NO llama a onClose al clickear el backdrop (reason: "backdropClick")', () => {
    const onClose = vi.fn();
    renderWithTheme(<Modal {...defaultProps} onClose={onClose} />);

    // MUI renderiza un backdrop con clase 'MuiBackdrop-root'
    const backdrop = document.querySelector<HTMLElement>('[class*="MuiBackdrop-root"]');
    expect(backdrop).toBeTruthy(); // sanity check

    // Click en el backdrop debe provocar reason="backdropClick"
    fireEvent.click(backdrop!);

    expect(onClose).not.toHaveBeenCalled();
  });

  it("no renderiza contenido cuando open es false", () => {
    renderWithTheme(<Modal {...defaultProps} open={false} />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
