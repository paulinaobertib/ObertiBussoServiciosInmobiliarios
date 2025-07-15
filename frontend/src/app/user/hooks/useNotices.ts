import { useCallback, useEffect, useState } from "react";
import * as service from "../services/notice.service";
import { Notice, NoticeCreate } from "../types/notice";
import { useAuthContext } from "../../user/context/AuthContext";

export function useNotices() {
  const { info } = useAuthContext();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* -------- helpers -------- */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const list = await service.getAllNotices();
      setNotices(list);
      setError(null);
      return list;
    } catch (e: any) {
      setError(e.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const search = useCallback(async (txt: string) => {
    setLoading(true);
    try {
      const list = await service.searchNoticesByText(txt);
      setNotices(list);
      setError(null);
      return list;
    } catch (e: any) {
      setError(e.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const add = async (body: NoticeCreate) => {
    setLoading(true);
    await service.createNotice({ ...body, userId: info!.id });
    await fetchAll();
    setLoading(false);
  };

  const edit = async (notice: Notice) => {
    setLoading(true);
    await service.updateNotice({ ...notice, userId: info!.id });
    await fetchAll();
    setLoading(false);
  };

  const remove = async (id: number) => {
    setLoading(true);
    await service.deleteNotice(id);
    await fetchAll();
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return { notices, loading, error, fetchAll, search, add, edit, remove };
}
