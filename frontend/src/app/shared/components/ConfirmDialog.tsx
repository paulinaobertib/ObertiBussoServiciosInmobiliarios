import { useGlobalAlert } from "../context/AlertContext";
import type { FC, ReactNode } from "react";

type AskOptions = {
  double?: boolean; // si true: doble confirmación con swap en paso 2
  step2Title?: string;
  step2Description?: ReactNode;
  primaryLabel?: string;
  secondaryLabel?: string;
};

const DEFAULT_DOUBLE = true;

export function useConfirmDialog() {
  const { confirm, doubleConfirm } = useGlobalAlert();

  const ask = async (question: string, onConfirm: () => void | Promise<void>, opts?: AskOptions) => {
    const useDouble = opts?.double ?? DEFAULT_DOUBLE;

    const ok = useDouble
      ? await doubleConfirm({
          title: "Esta acción es sensible",
          description: question,
          step2Title: "¿Estás seguro? No podrás deshacerlo.",
          step2Description: "Confirmá nuevamente para continuar.",
          primaryLabel: "Continuar",
          secondaryLabel: "Cancelar",
          swapOnSecond: true,
        })
      : await confirm({
          title: "¿Confirmás la acción?",
          description: question,
          primaryLabel: opts?.primaryLabel ?? "Confirmar",
          secondaryLabel: opts?.secondaryLabel ?? "Cancelar",
        });

    if (ok) await onConfirm();
    return ok;
  };

  const DialogUI: FC = () => null; // compatibilidad
  return { ask, DialogUI };
}
