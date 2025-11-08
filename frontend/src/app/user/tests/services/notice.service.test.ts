import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createNotice,
  getAllNotices,
  getNoticeById,
  updateNotice,
  deleteNotice,
  searchNoticesByText,
} from "../../services/notice.service";

vi.mock("../../../../api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import { api } from "../../../../api";

const resp = (data: any) => ({ data });

function formToObject(fd: FormData) {
  const out: Record<string, any> = {};
  for (const [k, v] of fd.entries()) {
    if (v instanceof File) out[k] = `File(${v.name})`;
    else out[k] = String(v);
  }
  return out;
}

describe("notice.service", () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
    vi.useRealTimers();
  });

  it("createNotice: POST /users/notices/create con FormData (incluye mainImage si es File) y headers multipart", async () => {
    const file = new File([new Uint8Array([1, 2])], "pic.png", { type: "image/png" });
    const body = {
      userId: "u1",
      title: "Titulo",
      description: "Desc",
      mainImage: file,
    } as any;

    const created = { id: 10, ...body, mainImage: undefined };
    (api.post as any).mockResolvedValueOnce(resp(created));

    const r = await createNotice(body);

    expect(api.post).toHaveBeenCalledTimes(1);
    const [url, form, config] = (api.post as any).mock.calls[0];

    expect(url).toBe("/users/notices/create");
    expect(form).toBeInstanceOf(FormData);
    expect(config).toEqual({
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });

    const sent = formToObject(form);
    expect(sent).toMatchObject({
      userId: "u1",
      title: "Titulo",
      description: "Desc",
      mainImage: "File(pic.png)",
    });

    expect(r).toEqual(created);
  });

  it("createNotice: no incluye mainImage si viene undefined/null", async () => {
    const body = {
      userId: "u2",
      title: "Sin imagen",
      description: "Texto",
      mainImage: undefined,
    } as any;

    (api.post as any).mockResolvedValueOnce(resp({ id: 11 }));

    await createNotice(body);

    const [, form] = (api.post as any).mock.calls[0];
    const sent = formToObject(form);
    expect(sent).toMatchObject({
      userId: "u2",
      title: "Sin imagen",
      description: "Texto",
    });
    expect("mainImage" in sent).toBe(false);
  });

  it("getAllNotices: GET /users/notices/getAll con withCredentials, retorna data", async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: 1 }, { id: 2 }]));
    const r = await getAllNotices();
    expect(api.get).toHaveBeenCalledWith("/users/notices/getAll", { withCredentials: true });
    expect(r).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it("getNoticeById: GET /users/notices/getById/{id}", async () => {
    (api.get as any).mockResolvedValueOnce(resp({ id: 7 }));
    const r = await getNoticeById(7);
    expect(api.get).toHaveBeenCalledWith("/users/notices/getById/7", { withCredentials: true });
    expect(r).toEqual({ id: 7 });
  });

  it("updateNotice: PUT /users/notices/update/{id} con FormData (fecha ISO fija) y headers multipart", async () => {
    // Fecha determinista
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-08-12T10:00:00.000Z"));

    const file = new File([new Uint8Array([3, 4])], "new.png", { type: "image/png" });
    const notice = {
      id: 5,
      userId: "u1",
      title: "Nuevo título",
      description: "Nueva desc",
      mainImage: file,
    } as any;

    (api.put as any).mockResolvedValueOnce(resp({ ok: true }));

    const r = await updateNotice(notice);

    expect(api.put).toHaveBeenCalledTimes(1);
    const [url, form, config] = (api.put as any).mock.calls[0];

    expect(url).toBe("/users/notices/update/5");
    expect(form).toBeInstanceOf(FormData);
    expect(config).toEqual({
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });

    const sent = formToObject(form);
    expect(sent).toMatchObject({
      userId: "u1",
      title: "Nuevo título",
      description: "Nueva desc",
      date: "2025-08-12T10:00:00.000Z",
      mainImage: "File(new.png)",
    });

    expect(r).toEqual({ ok: true });
  });

  it("deleteNotice: DELETE /users/notices/delete/{id}", async () => {
    (api.delete as any).mockResolvedValueOnce(resp("ok"));
    const r = await deleteNotice(99);
    expect(api.delete).toHaveBeenCalledWith("/users/notices/delete/99", { withCredentials: true });
    expect(r).toBe("ok");
  });

  it("searchNoticesByText: GET /users/notices/search con params {text}", async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: "n" }]));
    const r = await searchNoticesByText("foo");
    expect(api.get).toHaveBeenCalledWith("/users/notices/search", {
      params: { text: "foo" },
      withCredentials: true,
    });
    expect(r).toEqual([{ id: "n" }]);
  });
});
