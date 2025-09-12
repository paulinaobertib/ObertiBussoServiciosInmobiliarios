import { useEffect, useRef, useState } from "react";
import { getUtilityById } from "../../services/utility.service";

type UtilityLike = {
  utilityId?: number | null;
  utility?: { name?: string | null } | null;
};

export function useUtilityNames(utilities: UtilityLike[] | undefined) {
  const [map, setMap] = useState<Record<number, string>>({});
  const inflightIds = useRef<Set<number>>(new Set()); // ✅ no promises, solo ids

  useEffect(() => {
    const idsToFetch = Array.from(
      new Set(
        (utilities ?? [])
          .filter(u => u.utilityId != null)
          .map(u => u.utilityId as number)
      )
    )
      // si ya tengo el nombre, no busco
      .filter(id => map[id] == null)
      // si ya hay una request en vuelo para ese id, no duplico
      .filter(id => !inflightIds.current.has(id));

    if (idsToFetch.length === 0) return;

    idsToFetch.forEach(id => {
      inflightIds.current.add(id);
      getUtilityById(id)
        .then(data => {
          const name = data?.name ?? String(id);
          setMap(prev => ({ ...prev, [id]: name }));
        })
        .catch(() => {
          // fallback si falla
          setMap(prev => ({ ...prev, [id]: String(id) }));
        })
        .finally(() => {
          inflightIds.current.delete(id);
        });
    });
  }, [utilities, map]);

  return map; // { [utilityId]: "Nombre" }
}
