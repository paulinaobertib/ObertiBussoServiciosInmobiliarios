/// <reference types="vitest" />
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import { FavoriteButton } from "../../../components/favorites/FavoriteButtom";

// Mock del contexto useFavoritesContext
vi.mock("../../../context/FavoritesContext", () => ({
  useFavoritesContext: vi.fn(),
}));

import { useFavoritesContext } from "../../../context/FavoritesContext";

describe("FavoriteButton", () => {
  const toggleFavoriteMock = vi.fn();
  const isFavoriteMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra el icono lleno cuando la propiedad es favorita", () => {
    (useFavoritesContext as Mock).mockReturnValue({
      isFavorite: () => true,
      toggleFavorite: toggleFavoriteMock,
      loading: false,
      isToggling: () => false,
    });

    render(<FavoriteButton propertyId={1} />);

    expect(screen.getByTestId("FavoriteIcon")).toBeInTheDocument();
  });

  it("muestra el icono vacío cuando la propiedad NO es favorita", () => {
    (useFavoritesContext as Mock).mockReturnValue({
      isFavorite: () => false,
      toggleFavorite: toggleFavoriteMock,
      loading: false,
      isToggling: () => false,
    });

    render(<FavoriteButton propertyId={1} />);

    expect(screen.getByTestId("FavoriteBorderIcon")).toBeInTheDocument();
  });

  it("llama a toggleFavorite al hacer click", () => {
    (useFavoritesContext as Mock).mockReturnValue({
      isFavorite: isFavoriteMock.mockReturnValue(false),
      toggleFavorite: toggleFavoriteMock,
      loading: false,
      isToggling: () => false,
    });

    render(<FavoriteButton propertyId={123} />);

    fireEvent.click(screen.getByRole("button"));
    expect(toggleFavoriteMock).toHaveBeenCalledWith(123);
  });

  it("deshabilita el botón cuando loading es true", () => {
    (useFavoritesContext as Mock).mockReturnValue({
      isFavorite: () => false,
      toggleFavorite: toggleFavoriteMock,
      loading: true,
      isToggling: () => false,
    });

    render(<FavoriteButton propertyId={1} />);

    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("deshabilita el botón cuando la propiedad está en toggle", () => {
    (useFavoritesContext as Mock).mockReturnValue({
      isFavorite: () => false,
      toggleFavorite: toggleFavoriteMock,
      loading: false,
      isToggling: (id: number) => id === 1,
    });

    render(<FavoriteButton propertyId={1} />);

    expect(screen.getByRole("button")).toBeDisabled();
  });
});
