import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BasePage } from "./BasePage";
import { Box, Button, Card, CardContent, CircularProgress, Divider, Typography } from "@mui/material";
import { ContractUtilitiesStep } from "../app/user/components/contract-utilities/ContractUtilitiesStep";
import { getContractUtilitiesByContract } from "../app/user/services/contractUtility.service";
import type { ContractUtilityGet } from "../app/user/types/contractUtility";
import { useUtilities } from "../app/user/hooks/useUtilities";
import { ROUTES } from "../lib";

export default function ContractUtilitiesPage() {
  const { id } = useParams<{ id: string }>();
  const contractId = Number(id);
  const navigate = useNavigate();
  const { fetchById } = useUtilities();

  const [loading, setLoading] = useState<boolean>(true);
  const [rows, setRows] = useState<ContractUtilityGet[]>([]);
  const [nameMap, setNameMap] = useState<Record<number, string>>({});

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const list = await getContractUtilitiesByContract(contractId);
        setRows(list || []);
        const copy = { ...nameMap };
        for (const cu of list || []) {
          if (!copy[cu.utilityId]) {
            try {
              const util = await fetchById(cu.utilityId);
              if (util) copy[cu.utilityId] = util.name;
            } catch {}
          }
        }
        setNameMap(copy);
      } finally {
        setLoading(false);
      }
    })();
  }, [contractId]);

  const renderList = () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {rows.map((cu) => (
        <Card key={cu.id} variant="outlined">
          <CardContent>
            <Typography fontWeight={700}>{nameMap[cu.utilityId] ?? `Cargando...`}</Typography>
            <Typography variant="body2" color="text.secondary">
              Periodicidad: {String((cu as any).periodicity)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Monto inicial: ${Number((cu as any).initialAmount ?? 0).toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Último pago: {cu.lastPaidDate ? new Date(cu.lastPaidDate).toLocaleString() : "—"}
            </Typography>
          </CardContent>
        </Card>
      ))}
      {!rows.length && <Typography variant="body2">No hay servicios vinculados aún.</Typography>}
    </Box>
  );

  return (
    <BasePage>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h6" fontWeight={700}>
            Servicios del contrato
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button variant="outlined" onClick={() => navigate(ROUTES.CONTRACT)}>
            Cancelar
          </Button>
        </Box>

        {loading ? (
          <Box textAlign="center">
            <CircularProgress />
          </Box>
        ) : (
          renderList()
        )}

        <Divider sx={{ my: 1 }} />

        <ContractUtilitiesStep
          contractId={contractId}
          onSaved={() => navigate(ROUTES.CONTRACT)}
        />
      </Box>
    </BasePage>
  );
}
