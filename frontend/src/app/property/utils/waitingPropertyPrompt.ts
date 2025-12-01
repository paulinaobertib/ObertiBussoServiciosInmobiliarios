import type { Property } from "../types/property";

const DISMISSED_KEY = "waitingPropsDismissedIds";

const getStorage = () => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const safeJsonParse = (raw: string | null) => {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const readDismissedIds = (): number[] => {
  const storage = getStorage();
  const raw = storage?.getItem?.(DISMISSED_KEY) ?? null;
  const parsed = safeJsonParse(raw);
  return Array.isArray(parsed) ? parsed.map((n) => Number(n)) : [];
};

export const hasWaitingPromptBeenDismissed = (id: number) => {
  return readDismissedIds().includes(Number(id));
};

export const dismissWaitingPrompt = (id: number) => {
  const prev = new Set(readDismissedIds());
  prev.add(Number(id));
  try {
    const storage = getStorage();
    storage?.setItem?.(DISMISSED_KEY, JSON.stringify(Array.from(prev)));
  } catch {}
};

interface PromptOptions {
  property: Property;
  alertApi: any;
  onRenewContract: () => void;
  onViewProperty: () => void;
}

export const promptWaitingProperty = async ({ property, alertApi, onRenewContract, onViewProperty }: PromptOptions) => {
  const propId = Number(property.id);
  const title = "Propiedad en estado ESPERA";
  const description =
    `La propiedad "${property.title}" quedó en ESPERA por vencimiento de contrato.\n` + `¿Qué querés hacer?`;

  const markAnd = (fn: () => void) => {
    dismissWaitingPrompt(propId);
    fn();
  };

  if (typeof alertApi?.confirm === "function") {
    const goRenew = await alertApi.confirm({
      title,
      description,
      primaryLabel: "Renovar contrato",
      secondaryLabel: "Ver propiedad",
    });
    if (goRenew) {
      markAnd(onRenewContract);
    } else {
      markAnd(onViewProperty);
    }
    return;
  }

  if (typeof alertApi?.warning === "function") {
    await alertApi.warning({ title, description, primaryLabel: "Ver propiedad" });
    markAnd(onViewProperty);
    return;
  }

  if (typeof alertApi?.showAlert === "function") {
    alertApi.showAlert(description ?? title, "warning");
    markAnd(onViewProperty);
  }
};
