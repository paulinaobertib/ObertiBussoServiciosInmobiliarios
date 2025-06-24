import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

/* GET /favorites/user/{userId} */
export const getFavoritesByUser = async (userId: string) => {
  try {
    const response = await axios.get(
      `${apiUrl}/users/favorites/user/${userId}`,
      {
        withCredentials: true,
      }
    );
    return response;
  } catch (error) {
    console.error("Error fetching favorites by user:", error);
    throw error;
  }
};

/* POST /favorites/create */
export const createFavorite = async (userId: string, propertyId: number) => {
  try {
    const response = await axios.post(
      `${apiUrl}/users/favorites/create`,
      { userId, propertyId },
      { withCredentials: true }
    );
    return response;
  } catch (error) {
    console.error("Error creating favorite:", error);
    throw error;
  }
};

/* DELETE /favorites/delete/{id} */
export const deleteFavorite = async (favoriteId: number) => {
  try {
    const response = await axios.delete(
      `${apiUrl}/users/favorites/delete/${favoriteId}`,
      { withCredentials: true }
    );
    return response;
  } catch (error) {
    console.error("Error deleting favorite:", error);
    throw error;
  }
};

/* GET /favorites/property/{propertyId} */
export const getFavoritesByProperty = async (propertyId: number) => {
  try {
    const response = await axios.get(
      `${apiUrl}/users/favorites/property/${propertyId}`,
      { withCredentials: true }
    );
    return response;
  } catch (error) {
    console.error("Error fetching favorites by property:", error);
    throw error;
  }
};
