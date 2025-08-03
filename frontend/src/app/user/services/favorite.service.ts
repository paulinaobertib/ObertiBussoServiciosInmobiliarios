import { api } from "../../../api";

/* POST /favorites/create */
export const createFavorite = async (userId: string, propertyId: number) => {
  try {
    const data = await api.post(
      `/users/favorites/create`,
      { userId, propertyId },
      { withCredentials: true }
    );
    return data;
  } catch (error) {
    console.error("Error creating favorite:", error);
    throw error;
  }
};

/* GET /favorites/user/{userId} */
export const getFavoritesByUser = async (userId: string) => {
  try {
    const data = await api.get(`/users/favorites/user/${userId}`, {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("Error fetching favorites by user:", error);
    throw error;
  }
};

/* DELETE /favorites/delete/{id} */
export const deleteFavorite = async (favoriteId: number) => {
  try {
    const data = await api.delete(`/users/favorites/delete/${favoriteId}`, {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("Error deleting favorite:", error);
    throw error;
  }
};

/* GET /favorites/property/{propertyId} */
export const getFavoritesByProperty = async (propertyId: number) => {
  try {
    const data = await api.get(`/users/favorites/property/${propertyId}`, {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("Error fetching favorites by property:", error);
    throw error;
  }
};
