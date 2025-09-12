// import { useState, useEffect } from "react";
// import { Box, Button } from "@mui/material";
// import { Modal } from "../../../shared/components/Modal";
// import { IncreaseForm, IncreaseFormValues } from "../increases/IncreaseForm";
// import { postContractIncrease } from "../../services/contractIncrease.service";
// import type { Contract } from "../../types/contract";

// interface Props {
//     open: boolean;
//     contract: Contract | null;
//     onClose: () => void;
//     onSaved: () => void;
// }

// export const IncreaseDialog = ({ open, contract, onClose, onSaved }: Props) => {
//     const empty: IncreaseFormValues = {
//         date: "",
//         amount: "",
//         currency: "",
//         frequency: "",
//     };
//     const [vals, setVals] = useState<IncreaseFormValues>(empty);
//     const [saving, setSaving] = useState(false);

//     useEffect(() => {
//         setVals(empty);
//     }, [contract]);

//     const isValid = vals.date && vals.amount !== "" && Number(vals.amount) > 0 && vals.currency && vals.frequency !== "" && Number(vals.frequency) > 0;

//     const handleSave = async () => {
//         if (!contract) return;
//         if (!isValid) return;
//         setSaving(true);

//         // Ajuste: añadimos hora al campo date
//         const payload = {
//             date: `${vals.date}T00:00:00`,
//             amount: Number(vals.amount),
//             currency: vals.currency,
//             frequency: Number(vals.frequency),
//             contractId: contract.id,
//         };

//         try {
//         await postContractIncrease(payload);
//         onSaved();
//         } catch (e) {
//         console.error("Error creating contract increase:", e);
//         } finally {
//         setSaving(false);
//         }
//     };

//     return (
//         <Modal open={open} title="Nuevo Aumento" onClose={onClose}>
//             <IncreaseForm initialValues={vals} onChange={setVals} />
//             <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
//                 <Button onClick={onClose} disabled={saving}>Cancelar</Button>
//                 <Button variant="contained" disabled={saving || !isValid} onClick={handleSave}>
//                     {saving ? "Guardando…" : "Guardar"}
//                 </Button>
//             </Box>
//         </Modal>
//     );
// };
