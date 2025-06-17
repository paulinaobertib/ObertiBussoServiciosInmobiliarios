import axios from "axios";
import { User, UserCreate, Role } from "../types/user";

const apiUrl = import.meta.env.VITE_API_URL;

/** `/users/user/me` */
export const getMe = async () => {
  try {
    const { data } = await axios.get<User>(`${apiUrl}/users/user/me`, { withCredentials: false }
    );
    return data;
  } catch (error) {
    console.error("Error fetching /me:", error);
    throw error;
  }
};

/** `/users/user/role/{id}` */
export const getRoles = async (id: string) => {
  try {
    const { data } = await axios.get<Role[]>(`${apiUrl}/users/user/role/${id}`);
    return data.map((r) => r.toUpperCase() as Role);
  } catch (error) {
    console.error("Error fetching roles:", error);
    throw error;
  }
};

/** `/users/user/create`  (admin) */
export const postUser = async (body: UserCreate) => {
  try {
    const { data } = await axios.post(`${apiUrl}/users/user/create`, body);
    return data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

/** `/users/user/getById/{id}` */
export const getUserById = async (id: string) => {
  try {
    const { data } = await axios.get<User>(
      `${apiUrl}/users/user/getById/${id}`
    );
    return data;
  } catch (error) {
    console.error("Error fetching user by id:", error);
    throw error;
  }
};

/** `/users/user/getTenants` */
export const getTenants = async () => {
  try {
    const { data } = await axios.get<User[]>(`${apiUrl}/users/user/getTenants`);
    return data;
  } catch (error) {
    console.error("Error fetching tenants:", error);
    throw error;
  }
};

/** `/users/user/getAll` */
export const getAllUsers = async () => {
  try {
    const { data } = await axios.get<User[]>(`${apiUrl}/users/user/getAll`);
    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

/** `/users/user/findUser?searchTerm=` */
export const searchUsersByText = async (searchTerm: string) => {
  try {
    const { data } = await axios.get<User[]>(`${apiUrl}/users/user/findUser`, {
      params: { searchTerm },
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
    const { data } = await axios.put<User>(`${apiUrl}/users/user/update`, body);
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
      { params: { role } }
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
    const { data } = await axios.delete(`${apiUrl}/users/user/delete/${id}`);
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
      { params: { role } }
    );
    return data;
  } catch (error) {
    console.error("Error deleting role:", error);
    throw error;
  }
};
