import { Modal } from "../../../shared/components/Modal";
import { GuarantorsSection } from "./GuarantorsSection";
import { addGuarantorToContract } from "../../services/guarantor.service";

interface Props {
  open: boolean;
  contractId: number;
  onClose: () => void;
  onLinked?: () => void;
}

export function GuarantorPickerDialog({ open, contractId, onClose, onLinked }: Props) {
  return (
    <Modal open={open} title="Seleccionar garantes" onClose={onClose}>
      <GuarantorsSection
        toggleSelect={async (ids) => {
          const arr = (ids as any[]).map((s) => Number(s));
          for (const id of arr) {
            await addGuarantorToContract(id, contractId);
          }
          onLinked?.();
          onClose();
        }}
        isSelected={() => false}
      />
    </Modal>
  );
}
