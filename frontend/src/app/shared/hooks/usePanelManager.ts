import { useState } from "react";

export type PanelKey = string;

/**
 * Maneja un conjunto de paneles (por key) con estado abierto/cerrado.
 */
export function usePanelManager(keys: PanelKey[]) {
  const init = keys.reduce<Record<PanelKey, boolean>>((o, k) => ({ ...o, [k]: false }), {});
  const [open, setOpen] = useState(init);

  const toggle = (key: PanelKey) =>
    setOpen((prev) => {
      // cerramos todos
      const next: Record<PanelKey, boolean> = {};
      keys.forEach((k) => {
        next[k] = false;
      });
      // sólo alternamos el que pulsaste
      next[key] = !prev[key];
      return next;
    });

  return { open, toggle };
}
