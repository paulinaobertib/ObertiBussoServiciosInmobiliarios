import React, { useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import { InquiryItem } from './InquiryItem';
import { ChatSessionItem } from '../../../chat/components/ChatSessionItem';
import type { Inquiry } from '../../types/inquiry';
import type { ChatSessionGetDTO } from '../../../chat/types/chatSession';
import { getPropertyById } from '../../services/property.service';

interface Props {
  inquiries?: Inquiry[];
  chatSessions?: ChatSessionGetDTO[];
  loadingId: number | null;
  onResolve: (id: number) => void;
  onCloseChat: (id: number) => void;

  // filtros
  filterStatus: '' | 'ABIERTA' | 'CERRADA';
  filterProp: number | '';

  // catálogo de propiedades disponible en memoria
  properties: { id: number; title: string }[];
}

type MixedItem =
  | { type: 'inquiry'; date: string; id: number; data: Inquiry }
  | { type: 'chat'; date: string; id: number; data: ChatSessionGetDTO };

export const MixedList = React.memo(function MixedList({
  inquiries = [],
  chatSessions = [],
  loadingId,
  onResolve,
  onCloseChat,
  filterStatus,
  filterProp,
  properties,
}: Props) {
  // --------- Mapas para resolver títulos/ids una sola vez ----------
  const idToTitle = useMemo(() => {
    const m = new Map<number, string>();
    properties.forEach((p) => m.set(p.id, p.title));
    return m;
  }, [properties]);

  const titleToId = useMemo(() => {
    const m = new Map<string, number>();
    properties.forEach((p) => m.set(p.title, p.id));
    return m;
  }, [properties]);

  // Cache local para títulos faltantes (ids que no vinieron en "properties")
  const [extraTitles, setExtraTitles] = useState<Map<number, string>>(new Map());

  // Dedup: si faltan títulos para algún chat.propertyId, resolvemos en lote una sola vez
  useEffect(() => {
    const missing = Array.from(
      new Set(
        chatSessions
          .map((s) => s.propertyId)
          .filter(
            (id): id is number =>
              !!id && !idToTitle.has(id) && !extraTitles.has(id)
          )
      )
    );

    if (missing.length === 0) return;

    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        missing.map(async (id) => {
          try {
            const p = await getPropertyById(id);
            return [id, p.title] as const;
          } catch {
            return [id, `Propiedad ${id}`] as const; // fallback legible
          }
        })
      );
      if (cancelled) return;
      setExtraTitles((prev) => {
        const m = new Map(prev);
        entries.forEach(([id, title]) => m.set(id, title));
        return m;
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [chatSessions, idToTitle, extraTitles]);

  // ---------------------- Filtros unificados -----------------------
  const getStatus = (item: MixedItem) =>
    item.type === 'inquiry'
      ? item.data.status // 'ABIERTA' | 'CERRADA'
      : (item.data.dateClose ? 'CERRADA' : 'ABIERTA');

  const matchesStatus = (item: MixedItem) => {
    if (!filterStatus) return true;
    if (filterStatus === 'ABIERTA' && item.type === 'chat') return false;
    return getStatus(item) === filterStatus;
  };

  const matchesProperty = (item: MixedItem) => {
    if (filterProp === '') return true;
    if (item.type === 'chat') return item.data.propertyId === filterProp;
    const titles = item.data.propertyTitles ?? [];
    return titles.some((t) => titleToId.get(t) === filterProp);
  };


  // Mezcla, orden y filtro memoizados (no muta arrays originales)
  const filtered = useMemo(() => {
    const all: MixedItem[] = [
      ...inquiries.map(i => ({ type: 'inquiry' as const, date: i.date, id: i.id, data: i })),
      ...chatSessions.map(s => ({ type: 'chat' as const, date: s.date, id: s.id, data: s })),
    ];
    return all
      .slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .filter(it => matchesStatus(it) && matchesProperty(it));
  }, [inquiries, chatSessions, filterStatus, filterProp, titleToId]);

  // --------------------------- Render ------------------------------
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {filtered.map((item) =>
        item.type === 'inquiry' ? (
          <InquiryItem
            key={`inq-${item.id}`}
            inquiry={item.data}
            loading={loadingId === item.id}
            onResolve={onResolve}
            properties={properties} // evita fetch por card
          />
        ) : (
          <ChatSessionItem
            key={`chat-${item.id}`}
            session={item.data}
            loading={loadingId === item.id}
            onClose={onCloseChat}
            // Título resuelto siempre por id (de catálogo o cache local)
            propertyTitle={
              item.data.propertyId
                ? idToTitle.get(item.data.propertyId) ??
                extraTitles.get(item.data.propertyId)
                : undefined
            }
          />
        )
      )}
    </Box>
  );
});