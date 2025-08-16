import { useCallback, useEffect, useState } from "react";
import * as service from "../services/notice.service";
import { Notice, NoticeCreate } from "../types/notice";
import { useAuthContext } from "../../user/context/AuthContext";
import { useApiErrors } from "../../shared/hooks/useErrors";

export function useNotices() {
  const { info } = useAuthContext();
  const { handleError } = useApiErrors();

  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* -------- helpers -------- */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const list = await service.getAllNotices();
      setNotices(list);
      setError(null);
      return list;
    } catch (e) {
      setError(handleError(e));
      return [];
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const search = useCallback(
    async (txt: string) => {
      setLoading(true);
      try {
        const list = await service.searchNoticesByText(txt);
        setNotices(list);
        setError(null);
        return list;
      } catch (e) {
        setError(handleError(e));
        return [];
      } finally {
        setLoading(false);
      }
    },
    [handleError]
  );

  const add = useCallback(
    async (body: NoticeCreate) => {
      if (!info?.id) {
        setError(handleError(new Error("No se encontró el usuario autenticado.")));
        return;
      }
      setLoading(true);
      try {
        await service.createNotice({ ...body, userId: info.id });
        await fetchAll();
      } catch (e) {
        setError(handleError(e));
      } finally {
        setLoading(false);
      }
    },
    [info?.id, fetchAll, handleError]
  );

  const edit = useCallback(
    async (notice: Notice) => {
      if (!info?.id) {
        setError(handleError(new Error("No se encontró el usuario autenticado.")));
        return;
      }
      setLoading(true);
      try {
        await service.updateNotice({ ...notice, userId: info.id });
        await fetchAll();
      } catch (e) {
        setError(handleError(e));
      } finally {
        setLoading(false);
      }
    },
    [info?.id, fetchAll, handleError]
  );

  const remove = useCallback(
    async (id: number) => {
      setLoading(true);
      try {
        await service.deleteNotice(id);
        await fetchAll();
      } catch (e) {
        setError(handleError(e));
      } finally {
        setLoading(false);
      }
    },
    [fetchAll, handleError]
  );

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { notices, loading, error, fetchAll, search, add, edit, remove };
}
