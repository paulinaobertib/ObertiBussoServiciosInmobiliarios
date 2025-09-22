// src/app/user/hooks/useNotices.ts
import { useCallback, useEffect, useState } from "react";
import * as service from "../services/notice.service";
import { Notice, NoticeCreate } from "../types/notice";
import { useAuthContext } from "../../user/context/AuthContext";
import { useApiErrors } from "../../shared/hooks/useErrors";
import { useGlobalAlert } from "../../shared/context/AlertContext";

export function useNotices() {
  const { info } = useAuthContext();
  const { handleError } = useApiErrors();
  const alertApi: any = useGlobalAlert();

  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ---------------- helpers de alertas ---------------- */
  const notifySuccess = useCallback(
    async (title: string, description?: string) => {
      if (typeof alertApi?.success === "function") {
        await alertApi.success({ title, description, primaryLabel: "Ok" });
      }
    },
    [alertApi]
  );

  const confirmDanger = useCallback(async () => {
    if (typeof alertApi?.doubleConfirm === "function") {
      return await alertApi.doubleConfirm({
        kind: "error",
        description: "Eliminar noticia?",
      });
    }
  }, [alertApi]);

  /* ---------------- CRUD & búsquedas ---------------- */
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
    async (body: NoticeCreate): Promise<boolean> => {
      if (!info?.id) {
        setError(handleError(new Error("No se encontró el usuario autenticado.")));
        return false;
      }
      setLoading(true);
      try {
        await service.createNotice({ ...body, userId: info.id });
        await notifySuccess("Aviso creado");
        await fetchAll();
        return true;
      } catch (e) {
        setError(handleError(e));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [info?.id, fetchAll, handleError, notifySuccess]
  );

  const edit = useCallback(
    async (notice: Notice): Promise<boolean> => {
      if (!info?.id) {
        setError(handleError(new Error("No se encontró el usuario autenticado.")));
        return false;
      }
      setLoading(true);
      try {
        await service.updateNotice({ ...notice, userId: info.id });
        await notifySuccess("Aviso actualizado");
        await fetchAll();
        return true;
      } catch (e) {
        setError(handleError(e));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [info?.id, fetchAll, handleError, notifySuccess]
  );

  const remove = useCallback(
    async (id: number): Promise<boolean> => {
      const ok = await confirmDanger();
      if (!ok) return false;
      setLoading(true);
      try {
        await service.deleteNotice(id);
        await notifySuccess("Aviso eliminado");
        await fetchAll();
        return true;
      } catch (e) {
        setError(handleError(e));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchAll, handleError, notifySuccess, confirmDanger]
  );

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { notices, loading, error, fetchAll, search, add, edit, remove };
}
