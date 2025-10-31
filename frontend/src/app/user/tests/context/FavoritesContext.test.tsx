/// <reference types="vitest" />
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, Mock } from "vitest";
import { FavoritesProvider, useFavoritesContext } from "../../context/FavoritesContext";

// Mock del hook useFavorites
vi.mock("../../hooks/useFavorites", () => ({
  useFavorites: vi.fn(),
}));

import { useFavorites } from "../../hooks/useFavorites";

describe("FavoritesContext", () => {
  const mockFavoritesData = {
    favorites: [{ id: 1, propertyId: 10 }],
    loading: false,
    isFavorite: vi.fn((id: number) => id === 10),
    toggleFavorite: vi.fn(async () => {}),
    isToggling: vi.fn(() => false),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useFavorites as Mock).mockReturnValue(mockFavoritesData);
  });

  it("provee correctamente los valores del hook useFavorites", () => {
    const { result } = renderHook(() => useFavoritesContext(), {
      wrapper: ({ children }) => <FavoritesProvider>{children}</FavoritesProvider>,
    });

    expect(result.current.favorites).toEqual(mockFavoritesData.favorites);
    expect(result.current.loading).toBe(false);
    expect(typeof result.current.isFavorite).toBe("function");
    expect(typeof result.current.toggleFavorite).toBe("function");
    expect(typeof result.current.isToggling).toBe("function");
  });

  it("lanza un error si se usa fuera del provider", () => {
    expect(() => renderHook(() => useFavoritesContext())).toThrowError(
      "useFavoritesContext must be used within a FavoritesProvider"
    );
  });

  it("ejecuta correctamente los métodos del contexto", async () => {
    const { result } = renderHook(() => useFavoritesContext(), {
      wrapper: ({ children }) => <FavoritesProvider>{children}</FavoritesProvider>,
    });

    expect(result.current.isFavorite(10)).toBe(true);
    expect(result.current.isToggling(10)).toBe(false);

    await act(async () => {
      await result.current.toggleFavorite(10);
    });

    expect(mockFavoritesData.toggleFavorite).toHaveBeenCalledWith(10);
  });
});
