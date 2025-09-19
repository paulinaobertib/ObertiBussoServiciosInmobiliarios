/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import SessionExpiredDialog from "../../context/AuthExpired";

// --- Mocks ---
vi.mock("../../context/AuthContext", () => ({
  useAuthContext: vi.fn(),
}));

import { useAuthContext } from "../../context/AuthContext";

describe("SessionExpiredDialog", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("no renderiza nada si sessionExpired = false", () => {
    (useAuthContext as Mock).mockReturnValue({
      sessionExpired: false,
      login: vi.fn(),
    });

    const { container } = render(<SessionExpiredDialog />);
    expect(container).toBeEmptyDOMElement();
  });

  it("muestra loader con mensaje si sessionExpired = true", () => {
    (useAuthContext as Mock).mockReturnValue({
      sessionExpired: true,
      login: vi.fn(),
    });

    render(<SessionExpiredDialog />);
    // Spinner de MUI
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    // Mensaje real
    expect(
      screen.getByText(/tu sesión ha caducado/i)
    ).toBeInTheDocument();
  });

  it("llama a login después de 5 segundos si sessionExpired = true", () => {
    const login = vi.fn();
    (useAuthContext as Mock).mockReturnValue({
      sessionExpired: true,
      login,
    });

    render(<SessionExpiredDialog />);
    expect(login).not.toHaveBeenCalled();

    vi.advanceTimersByTime(5000);

    expect(login).toHaveBeenCalledTimes(1);
  });
});
