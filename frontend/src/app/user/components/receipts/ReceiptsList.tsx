import { useState } from "react";
import dayjs from "dayjs";
import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import BlockIcon from "@mui/icons-material/Block";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { CONCEPT_LABEL, MONTHS, type Receipt } from "../../types/receipt";
import { getReceiptPdf, receiptFileName } from "../../services/receipt.service";
import { downloadBlob } from "../../../shared/utils/download";
import { formatAmount } from "../../../shared/utils/numberFormat";
import { useApiErrors } from "../../../shared/hooks/useErrors";
import { EmptyState } from "../../../shared/components/EmptyState";

interface Props {
  receipts: Receipt[];
  /** admin: duplicar y anular */
  onDuplicate?: (r: Receipt) => void;
  onAnnul?: (r: Receipt) => void;
  showIssuer?: boolean;
  emptyTitle?: string;
}

const period = (r: Receipt) => (r.periodMonth ? `${MONTHS[r.periodMonth - 1]} ${r.periodYear}` : "—");

const money = (r: Receipt) => `${r.currency === "USD" ? "U$S" : "$"} ${formatAmount(r.total)}`;

function KindChip({ r }: { r: Receipt }) {
  if (r.status === "ANULADO") return <Chip size="small" color="error" variant="outlined" label="Anulado" />;
  return r.kind === "RECIBO" ? (
    <Chip size="small" color="success" variant="outlined" label="Recibo" />
  ) : (
    <Chip size="small" color="warning" variant="outlined" label="Liquidación" />
  );
}

export function ReceiptsList({ receipts, onDuplicate, onAnnul, showIssuer = true, emptyTitle }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { handleError } = useApiErrors();
  const [busyId, setBusyId] = useState<number | null>(null);
  const [menu, setMenu] = useState<{ anchor: HTMLElement; receipt: Receipt } | null>(null);

  const download = async (r: Receipt) => {
    setBusyId(r.id);
    try {
      downloadBlob(await getReceiptPdf(r.id), receiptFileName(r));
    } catch (e) {
      handleError(e);
    } finally {
      setBusyId(null);
    }
  };

  const view = async (r: Receipt) => {
    // se abre la pestaña antes del await para que el navegador no la bloquee
    const tab = window.open("", "_blank");
    try {
      const url = URL.createObjectURL(await getReceiptPdf(r.id));
      if (tab) tab.location.href = url;
      else window.location.href = url;
    } catch (e) {
      tab?.close();
      handleError(e);
    }
  };

  if (!receipts.length) return <EmptyState title={emptyTitle ?? "Todavía no hay recibos."} minHeight={200} />;

  const actions = (r: Receipt) => (
    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
      <Tooltip title="Ver">
        <IconButton size="small" onClick={() => view(r)}>
          <VisibilityIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Descargar PDF">
        <span>
          <IconButton size="small" color="primary" onClick={() => download(r)} disabled={busyId === r.id}>
            <DownloadIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      {(onDuplicate || onAnnul) && (
        <IconButton size="small" onClick={(e) => setMenu({ anchor: e.currentTarget, receipt: r })} aria-label="más acciones">
          <MoreVertIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );

  return (
    <>
      {isMobile ? (
        <Stack spacing={1.5}>
          {receipts.map((r) => (
            <Card key={r.id} variant="outlined" sx={{ opacity: r.status === "ANULADO" ? 0.65 : 1 }}>
              <CardContent sx={{ pb: "12px !important" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                  <Typography fontWeight={700}>{r.number}</Typography>
                  <KindChip r={r} />
                </Box>
                <Typography variant="body2">{r.payerName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {CONCEPT_LABEL[r.concept]} · {period(r)} · {dayjs(r.issueDate).format("DD/MM/YYYY")}
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                  <Typography fontWeight={800} color="primary.main">
                    {money(r)}
                  </Typography>
                  {actions(r)}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        <TableContainer component={Card} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Número</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Tipo</TableCell>
                {showIssuer && <TableCell>Emite</TableCell>}
                <TableCell>{showIssuer ? "Recibí de" : "Concepto"}</TableCell>
                <TableCell>Período</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {receipts.map((r) => (
                <TableRow key={r.id} hover sx={{ opacity: r.status === "ANULADO" ? 0.6 : 1 }}>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>{r.number}</TableCell>
                  <TableCell>{dayjs(r.issueDate).format("DD/MM/YYYY")}</TableCell>
                  <TableCell>
                    <KindChip r={r} />
                  </TableCell>
                  {showIssuer && <TableCell>{r.issuer === "INMOBILIARIA" ? "Inmobiliaria" : "Luis Oberti"}</TableCell>}
                  <TableCell>
                    {showIssuer ? (
                      <>
                        <Typography variant="body2">{r.payerName}</Typography>
                        {r.propertyAddress && (
                          <Typography variant="caption" color="text.secondary">
                            {r.propertyAddress}
                          </Typography>
                        )}
                      </>
                    ) : (
                      CONCEPT_LABEL[r.concept]
                    )}
                  </TableCell>
                  <TableCell>{period(r)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                    {money(r)}
                  </TableCell>
                  <TableCell align="right">{actions(r)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Menu anchorEl={menu?.anchor} open={Boolean(menu)} onClose={() => setMenu(null)}>
        {onDuplicate && (
          <MenuItem
            onClick={() => {
              onDuplicate(menu!.receipt);
              setMenu(null);
            }}
          >
            <ListItemIcon>
              <ContentCopyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Repetir para el mes siguiente" />
          </MenuItem>
        )}
        {onAnnul && menu?.receipt.status === "EMITIDO" && (
          <MenuItem
            onClick={() => {
              onAnnul(menu!.receipt);
              setMenu(null);
            }}
            sx={{ color: "error.main" }}
          >
            <ListItemIcon>
              <BlockIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText primary="Anular" />
          </MenuItem>
        )}
      </Menu>
    </>
  );
}
