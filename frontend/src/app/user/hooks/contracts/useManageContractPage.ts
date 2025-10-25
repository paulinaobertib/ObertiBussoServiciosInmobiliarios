import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGlobalAlert } from "../../../shared/context/AlertContext";
import { getContractById, postContract, putContract, getContractsByPropertyId } from "../../services/contract.service";
import {
  getGuarantorsByContract,
  addGuarantorToContract,
  removeGuarantorFromContract,
} from "../../services/guarantor.service";
import type { ContractCreate, ContractGet } from "../../types/contract";
import type { ContractFormHandle } from "../../components/contracts/ContractForm";
import { ROUTES } from "../../../../lib";
import { useApiErrors } from "../../../shared/hooks/useErrors";

export function useManageContractPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);

  const alertApi: any = useGlobalAlert();
  const { handleError } = useApiErrors();

  // Form ref & estado de validez
  const formRef = useRef<ContractFormHandle>(null);
  const [formReady, setFormReady] = useState(false);

  // Datos de contrato (solo en edición) y carga
  const [contract, setContract] = useState<ContractGet | null>(null);
  const [loading, setLoading] = useState<boolean>(isEdit);

  // Stepper
  const [activeStep, setActiveStep] = useState<number>(0);

  // Paso 1 & 2: IDs seleccionados
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [addGuarantors, setAddGuarantors] = useState<boolean>(false);
  const [selectedGuarantorIds, setSelectedGuarantorIds] = useState<number[]>([]);
  // const [selectedUtilityIds, setSelectedUtilityIds] = useState<number[]>([]);

  // Comisión inmediata post-creación
  const [commissionContractId, setCommissionContractId] = useState<number | null>(null);
  const afterCommissionSaved = () => {
    setCommissionContractId(null);
    navigate(ROUTES.CONTRACT, { replace: true });
  };
  const openCommissionStep = () => {};

  /* -------------------- helpers de alertas -------------------- */
  const notifySuccess = useCallback(
    async (title: string, description?: string) => {
      if (typeof alertApi?.success === "function") {
        await alertApi.success({ title, description, primaryLabel: "Ok" });
      } else if (typeof alertApi?.showAlert === "function") {
        alertApi.showAlert(description ?? title, "success");
      }
    },
    [alertApi]
  );

  const confirm = useCallback(
    async (title: string, description?: string, primaryLabel = "Confirmar", secondaryLabel = "Cancelar") => {
      if (typeof alertApi?.confirm === "function") {
        return await alertApi.confirm({ title, description, primaryLabel, secondaryLabel });
      }
      return window.confirm(`${title}${description ? `\n\n${description}` : ""}`);
    },
    [alertApi]
  );

  const confirmDanger = useCallback(async () => {
    if (typeof alertApi?.doubleConfirm === "function") {
      return await alertApi.doubleConfirm({
        kind: "warning",
        description: "¿Cancelar los cambios?",
      });
    }
  }, [alertApi, confirm]);

  // --- Sincroniza garantes: el backend NO los actualiza en el PUT de contrato
  // Orden correcto de parámetros en backend: (guarantorId, contractId)
  const syncContractGuarantors = async (contractId: number, newIds: number[]) => {
    try {
      const resp = await getGuarantorsByContract(contractId);
      const list = Array.isArray(resp) ? resp : Array.isArray((resp as any)?.data) ? (resp as any).data : [];
      const currentIds = list.map((g: any) => g.id);

      const toAdd = newIds.filter((gid) => !currentIds.includes(gid));
      const toRemove = currentIds.filter((gid: number) => !newIds.includes(gid));

      await Promise.all([
        ...toAdd.map((guarantorId) => addGuarantorToContract(guarantorId, contractId)),
        ...toRemove.map((guarantorId: number) => removeGuarantorFromContract(guarantorId, contractId)),
      ]);
    } catch (e) {
      // Si falla, no frenamos el flujo de guardado; log + alerta opcional
      handleError(e);
    }
  };

  // ── Preload en edición ──
  useEffect(() => {
    if (!isEdit) return;

    (async () => {
      setLoading(true);
      try {
        const data = await getContractById(Number(id!));
        setContract(data);
        setSelectedPropertyId(data.propertyId);
        setSelectedUserId(data.userId);
        // Precargar garantes desde el contrato (GetDTO)
        const guarIds = Array.isArray((data as any)?.guarantors)
          ? ((data as any).guarantors as Array<{ id: number }>).map((g) => g.id)
          : [];
        setSelectedGuarantorIds(guarIds);
      } catch (e) {
        handleError(e);
        navigate(ROUTES.CONTRACT, { replace: true });
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]); // id/isEdit suficientes; handleError/navigate son estables

  // ── Lógica de habilitación de botones ──
  const canProceed = () => {
    if (activeStep === 0) return selectedPropertyId != null;
    if (activeStep === 1) return selectedUserId != null; // garantes opcional
    if (activeStep === 2) return formReady; // Datos
    return false;
  };

  // ── Guardar / crear ──
  const save = async () => {
    await formRef.current?.submit();
    const payload: ContractCreate = formRef.current!.getCreateData();

    setLoading(true);
    try {
      if (isEdit) {
        // actualización: mapeo a ContractUpdate (sin id) y envío id por path
        await putContract(Number(id!), payload as any);
        await syncContractGuarantors(Number(id!), payload.guarantorsIds || []);
        await notifySuccess("Contrato actualizado");
        navigate(ROUTES.CONTRACT, { replace: true });
      } else {
        // creación
        await postContract(payload as any);

        let createdId: number | null = null;
        try {
          const list = await getContractsByPropertyId(payload.propertyId);
          const matches = (list || []).filter(
            (c: any) =>
              String(c.userId) === String(payload.userId) &&
              String(c.contractType) === String(payload.contractType) &&
              String((c.startDate || "").split("T")[0]) === String(payload.startDate)
          );
          const chosen = (matches.length ? matches : list).sort((a: any, b: any) => b.id - a.id)[0];
          createdId = chosen?.id ?? null;
        } catch (e) {
          // no es crítico; seguimos
        }

        if (createdId) {
          await syncContractGuarantors(createdId, payload.guarantorsIds || []);
        }

        // Redirigir al listado y mostrar confirm desde ese screen (ya migrado)
        navigate(ROUTES.CONTRACT, {
          state: { justCreated: true, createdId },
          replace: true,
        });
      }
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  };

  // ── Cancelar / Back ── (doble confirmación si existe)
  const cancel = async () => {
    const ok = await confirmDanger();
    if (!ok) return;
    formRef.current?.reset();
    navigate(ROUTES.CONTRACT, { replace: true });
  };

  // Título dinámico
  const title = isEdit ? "Editar Contrato" : "Crear Contrato";

  return {
    // Datos & loader
    contract,
    loading,

    // Stepper
    activeStep,
    setActiveStep,

    // Selecciones
    selectedPropertyId,
    setSelectedPropertyId,
    selectedUserId,
    setSelectedUserId,
    addGuarantors,
    setAddGuarantors,
    selectedGuarantorIds,
    setSelectedGuarantorIds,
    // selectedUtilityIds,
    // setSelectedUtilityIds,

    // Form
    formRef,
    formReady,
    setFormReady,

    // Controls
    canProceed,
    save,
    cancel,

    // Meta
    title,

    // Comisión inmediata
    commissionContractId,
    setCommissionContractId,
    openCommissionStep,
    afterCommissionSaved,
  };
}
