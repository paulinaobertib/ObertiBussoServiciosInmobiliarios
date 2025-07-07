import { useCallback, useEffect, useState } from "react";
import {
  getAllNotices,
  searchNoticesByText,
  createNotice,
  updateNotice,
  deleteNotice,
} from "../services/notice.service";
import type { Notice, NoticeCreate } from "../types/notice";
import { useAuthContext } from "../context/AuthContext";

export function useNotices() {
  const { info } = useAuthContext();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getAllNotices();
      setNotices(data);
      setError(null);
      return data;
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const search = useCallback(async (text: string) => {
    setLoading(true);
    try {
      const { data } = await searchNoticesByText(text);
      setNotices(data);
      setError(null);
      return data;
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const add = useCallback(
    async (body: NoticeCreate) => {
      setLoading(true);
      try {
        await createNotice({ ...body, userId: info!.id });
        return fetchAll();
      } finally {
        setLoading(false);
      }
    },
    [info, fetchAll]
  );

  const edit = useCallback(
    async (notice: Notice) => {
      setLoading(true);
      try {
        await updateNotice(notice);
        return fetchAll();
      } finally {
        setLoading(false);
      }
    },
    [fetchAll]
  );

  const remove = useCallback(
    async (id: number) => {
      setLoading(true);
      try {
        await deleteNotice(id);
        return fetchAll();
      } finally {
        setLoading(false);
      }
    },
    [fetchAll]
  );

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    notices,
    loading,
    error,
    fetchAll,
    search,
    add,
    edit,
    remove,
  };
}
