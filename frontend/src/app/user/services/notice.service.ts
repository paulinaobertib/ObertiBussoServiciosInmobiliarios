import { api } from "../../../api";
import { Notice, NoticeCreate } from "../types/notice";

/* ---------- helpers ---------- */
function makeForm(body: Partial<Notice>) {
  const fd = new FormData();
  Object.entries(body).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (k === "mainImage" && v instanceof File) fd.append("mainImage", v);
    else fd.append(k, String(v));
  });
  return fd;
}

/* ---------- CRUD ---------- */
export async function createNotice(data: NoticeCreate): Promise<Notice> {
  const form = makeForm(data);
  const { data: created } = await api.post<Notice>("/users/notices/create", form, {
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: true,
  });
  return created;
}

export async function getAllNotices(): Promise<Notice[]> {
  const { data } = await api.get<Notice[]>("/users/notices/getAll", {
    withCredentials: true,
  });
  return data;
}

export async function getNoticeById(id: number): Promise<Notice> {
  const { data } = await api.get<Notice>(`/users/notices/getById/${id}`, {
    withCredentials: true,
  });
  return data;
}

export async function updateNotice(n: Notice): Promise<Notice> {
  const form = makeForm({
    userId: n.userId,
    title: n.title,
    description: n.description,
    // manda fecha ISO-8601 para cumplir con el controller
    date: new Date().toISOString(),
    mainImage: n.mainImage, // solo File si cambió
  });
  const { data } = await api.put<Notice>(`/users/notices/update/${n.id}`, form, {
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: true,
  });
  return data;
}

export async function deleteNotice(id: number): Promise<string> {
  const { data } = await api.delete<string>(`/users/notices/delete/${id}`, {
    withCredentials: true,
  });
  return data;
}

export async function searchNoticesByText(text: string): Promise<Notice[]> {
  const { data } = await api.get<Notice[]>("/users/notices/search", {
    params: { text },
    withCredentials: true,
  });
  return data;
}
