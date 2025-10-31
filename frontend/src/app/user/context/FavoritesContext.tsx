import { createContext, useContext, ReactNode } from "react";
import { useFavorites } from "../hooks/useFavorites";
import { Favorite } from "../types/favorite";

interface FavoritesContextType {
  favorites: Favorite[];
  loading: boolean;
  isFavorite: (propertyId: number) => boolean;
  toggleFavorite: (propertyId: number) => Promise<void>;
  isToggling: (propertyId: number) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

interface FavoritesProviderProps {
  children: ReactNode;
}

export function FavoritesProvider({ children }: FavoritesProviderProps) {
  const favoritesData = useFavorites();

  return (
    <FavoritesContext.Provider value={favoritesData}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavoritesContext() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavoritesContext must be used within a FavoritesProvider");
  }
  return context;
}
