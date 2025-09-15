import { Modal } from "../../../shared/components/Modal";
import { CommissionForm } from "./CommissionForm";
import type { Commission } from "../../types/commission";

interface Props {
  open: boolean;
  contractId?: number | null;
  action?: "add" | "edit" | "delete";
  item?: Commission | null;
  onClose: () => void;
  onSaved: () => void;
}

export const CommissionDialog = ({ open, contractId, action, item, onClose, onSaved }: Props) => {
  const title = action === "add" ? "Nueva comisión" : action === "edit" ? "Editar comisión" : "Eliminar comisión";

  return (
    <Modal open={open} title={title} onClose={onClose}>
      <CommissionForm
        action={action}
        item={item ?? undefined}
        contractId={contractId ?? undefined}
        onSuccess={() => {
          onSaved();
          onClose();
        }}
      />
    </Modal>
  );
};
