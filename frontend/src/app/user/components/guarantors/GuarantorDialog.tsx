// Actions are handled inside GuarantorForm
import { Modal } from "../../../shared/components/Modal";
import { GuarantorForm } from "./GuarantorForm";
import type { Guarantor } from "../../types/guarantor";

type Mode = "add" | "edit" | "delete";

interface Props {
  open: boolean;
  mode: Mode;
  item?: Guarantor | null;
  onClose: () => void;
  onSaved: () => void;
}

export function GuarantorDialog({ open, mode, item, onClose, onSaved }: Props) {
  const title = mode === "add" ? "Crear garante" : mode === "edit" ? "Editar garante" : "Eliminar garante";

  return (
    <Modal open={open} title={title} onClose={onClose}>
      <GuarantorForm action={mode} item={item ?? undefined} onSuccess={onSaved} onClose={onClose} />
    </Modal>
  );
}
