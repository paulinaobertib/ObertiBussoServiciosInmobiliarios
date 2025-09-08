import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Chip,
  Stack,
  IconButton,
} from "@mui/material";
import ReplyIcon from "@mui/icons-material/Reply";

import BasePage from "./BasePage.tsx";
import { getContractById } from "../app/user/services/contract.service.ts";
import type { ContractDetail, Contract } from "../app/user/types/contract.ts";
import { ContractStatus } from "../app/user/types/contract.ts";

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState<ContractDetail | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!id) return;
        const resp = await getContractById(Number(id));
        const data = (resp as any)?.data ?? resp;
        if (alive) setContract(data as ContractDetail);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  const typeLabel = (t?: Contract["contractType"]) => {
    if (!t) return "";
    const map: Record<string, string> = {
      VIVIENDA: "Vivienda",
      RESIDENCIAL: "Vivienda",
      COMERCIAL: "Comercial",
      TEMPORAL: "Temporal",
    };
    return map[t] ?? t.charAt(0) + t.slice(1).toLowerCase();
  };

  if (loading) {
    return (
      <BasePage>
        <Container sx={{ py: 6, textAlign: "center" }}>
          <CircularProgress />
        </Container>
      </BasePage>
    );
  }

  if (!contract) {
    return (
      <BasePage>
        <Container sx={{ py: 6 }}>
          <Typography sx={{ fontSize: "1rem" }}>
            No se encontró el contrato.
          </Typography>
        </Container>
      </BasePage>
    );
  }

  return (
    <>
      <IconButton
        size="small"
        onClick={() => navigate(-1)}
        sx={{ position: "absolute", top: 64, left: 8, zIndex: 3000 }}
      >
        <ReplyIcon />
      </IconButton>

      <BasePage>
        <Container maxWidth="lg" sx={{ py: 3 }}>
          {/* Encabezado */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              fontWeight={700}
              color="text.primary"
              sx={{ fontSize: "2rem", mb: 2 }}
            >
              Detalle de Contrato
            </Typography>
            <Stack direction="row" spacing={1}>
              {contract.contractType && (
                <Chip
                  size="medium"
                  label={typeLabel(contract.contractType)}
                  sx={{
                    bgcolor: "white",
                    color: "grey.700",
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "grey.300",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                />
              )}
              <Chip
                size="medium"
                label={contract.currency ?? "ARS"}
                sx={{
                  bgcolor: "white",
                  color: "grey.700",
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "grey.300",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              />
              <Chip
                size="medium"
                label={contract.contractStatus}
                sx={{
                  bgcolor:
                    contract.contractStatus === ContractStatus.ACTIVO
                      ? "#82eba8ff"
                      : "#f8a5a5ff",
                  color: "white",
                  borderRadius: 2,
                  fontSize: "0.875rem",
                  fontWeight: 600,
                }}
              />
            </Stack>
          </Box>
        </Container>
      </BasePage>
    </>
  );
}
