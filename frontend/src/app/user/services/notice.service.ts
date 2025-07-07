import { api } from "../../../api";
import { Notice, NoticeCreate } from "../types/notice";

/* POST /notices/create */
export const createNotice = async (body: NoticeCreate) => {
  try {
    const data = await api.post(`/users/notices/create`, body, {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("Error creating notice:", error);
    throw error;
  }
};

/* GET /notices/getAll/ */
export const getAllNotices = async () => {
  try {
    const data = await api.get(`/users/notices/getAll`, {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("Error fetching notices:", error);
    throw error;
  }
};

/* GET /notices/getById/${id} */
export const getNoticeById = async (id: number) => {
  try {
    const data = await api.get(`/users/notices/getById/${id}`, {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("Error fetching notices:", error);
    throw error;
  }
};

/* PUT /notices/update */
export const updateNotice = async (body: Notice) => {
  try {
    const data = await api.put(`/users/notices/update`, body, {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("Error updating notice:", error);
    throw error;
  }
};

/* DELETE /notices/delete/{id} */
export const deleteNotice = async (id: number) => {
  try {
    const data = await api.delete(`/users/notices/delete/${id}`, {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("Error deleting notice:", error);
    throw error;
  }
};

/* GET /notices/search?text= */
export const searchNoticesByText = async (text: string) => {
  try {
    const data = await api.get(`/users/notices/search`, {
      params: { text },
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("Error searching notices:", error);
    throw error;
  }
};
