import axios from "axios";
import { User, UserCreate, Role } from "../types/user";

const apiUrl = import.meta.env.VITE_API_URL;

/** `/users/user/me` */
export const getMe = async () => {
  try {
    const data = await axios.get(`${apiUrl}/users/user/me`, {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("Error fetching me:", error);
    throw error;
  }
};

/** `/users/user/role/{id}` */
export const getRoles = async (id: string) => {
  try {
    const data = await axios.get(`${apiUrl}/users/user/role/${id}`, {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("Error fetching roles:", error);
    throw error;
  }
};

/** `/users/user/create`  (admin) */
export const postUser = async (body: UserCreate) => {
  try {
    const data = await axios.post(`${apiUrl}/users/user/create`, body, {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

/** `/users/user/getById/{id}` */
export const getUserById = async (id: string) => {
  try {
    const data = await axios.get(`${apiUrl}/users/user/getById/${id}`, {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("Error fetching user by id:", error);
    throw error;
  }
};

/** `/users/user/getTenants` */
export const getTenants = async () => {
  try {
    const data = await axios.get(`${apiUrl}/users/user/getTenants`, {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("Error fetching tenants:", error);
    throw error;
  }
};

/** `/users/user/getAll` */
export const getAllUsers = async () => {
  try {
    const data = await axios.get(`${apiUrl}/users/user/getAll`, {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

/** `/users/user/findUser?searchTerm=` */
export const searchUsersByText = async (searchTerm: string) => {
  try {
    const data = await axios.get(`${apiUrl}/users/user/findUser`, {
      params: { searchTerm },
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("Error searching users:", error);
    throw error;
  }
};

/** `/users/user/exist/{id}`  → boolean */
export const userExists = async (id: string) => {
  try {
    const { data } = await axios.get<boolean>(
      `${apiUrl}/users/user/exist/${id}`
    );
    return data;
  } catch (error) {
    console.error("Error checking user existence:", error);
    throw error;
  }
};

/** `/users/user/update`  (PUT) */
export const putUser = async (body: User) => {
  try {
    const { data } = await axios.put(`${apiUrl}/users/user/update`, body, {
      withCredentials: true,
    });
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

/** `/users/user/update/role/{id}?role=` */
export const addRoleToUser = async (id: string, role: string) => {
  try {
    const { data } = await axios.put<Role[]>(
      `${apiUrl}/users/user/update/role/${id}`,
      null,
      { params: { role }, withCredentials: true }
    );
    return data;
  } catch (error) {
    console.error("Error adding role:", error);
    throw error;
  }
};

/*─────────────────────────────*
 *  DELETE
 *─────────────────────────────*/

/** `/users/user/delete/{id}` */
export const deleteUser = async (id: string) => {
  try {
    const { data } = await axios.delete(`${apiUrl}/users/user/delete/${id}`, {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

/** `/users/user/delete/role/{id}?role=` */
export const deleteRoleFromUser = async (id: string, role: string) => {
  try {
    const { data } = await axios.delete(
      `${apiUrl}/users/user/delete/role/${id}`,
      { params: { role }, withCredentials: true }
    );
    return data;
  } catch (error) {
    console.error("Error deleting role:", error);
    throw error;
  }
};
