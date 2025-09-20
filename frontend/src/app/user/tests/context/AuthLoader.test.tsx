/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import { AuthLoaderOverlay } from "../../context/AuthLoader";

// --- Mocks ---
vi.mock("../../context/AuthContext", () => ({
  useAuthContext: vi.fn(),
}));

import { useAuthContext } from "../../context/AuthContext";

describe("AuthLoaderOverlay", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra loader cuando loading = true", () => {
    (useAuthContext as Mock).mockReturnValue({ loading: true, refreshing: false });
    render(<AuthLoaderOverlay />);
    // El loader real renderiza un progressbar y un texto
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    expect(screen.getByText(/espera, estamos preparando/i)).toBeInTheDocument();
  });

  it("muestra loader cuando refreshing = true", () => {
    (useAuthContext as Mock).mockReturnValue({ loading: false, refreshing: true });
    render(<AuthLoaderOverlay />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("no muestra nada cuando loading y refreshing son false", () => {
    (useAuthContext as Mock).mockReturnValue({ loading: false, refreshing: false });
    const { container } = render(<AuthLoaderOverlay />);
    expect(container).toBeEmptyDOMElement();
  });
});
