import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import ReplyIcon from "@mui/icons-material/Reply";
import CalculateOutlinedIcon from "@mui/icons-material/CalculateOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import LinkIcon from "@mui/icons-material/Link";
import ScheduleIcon from "@mui/icons-material/Schedule";
import BasePage from "./BasePage";
import { ROUTES } from "../lib";
import { calculateRent } from "../app/shared/services/rentCalculator.service";
import type { RentCalculation, RentIndex, RentPeriod } from "../app/shared/types/rentCalculator";
import { formatAmount } from "../app/shared/utils/numberFormat";
import { extractApiError } from "../app/shared/utils/error";

const FREQUENCIES = [
  { value: 1, label: "Mensual" },
  { value: 2, label: "Bimestral" },
  { value: 3, label: "Trimestral" },
  { value: 4, label: "Cuatrimestral" },
  { value: 6, label: "Semestral" },
  { value: 12, label: "Anual" },
];

const INDEX_HELP: Record<RentIndex, string> = {
  IPC: "Índice de Precios al Consumidor del INDEC. Se aplica la variación de los meses del período.",
  ICL: "Índice para Contratos de Locación del BCRA (Ley 27.551). Se compara el valor del día de cada aumento.",
};

const money = (n: number | null | undefined) => `$ ${formatAmount(Math.round(Number(n ?? 0)))}`;
const pct = (n: number | null | undefined) => `${Number(n ?? 0) >= 0 ? "+" : ""}${formatAmount(n ?? 0)}%`;
const day = (iso: string) => dayjs(iso).format("DD/MM/YYYY");

const defaultStart = () => dayjs().subtract(1, "year").startOf("month").format("YYYY-MM-DD");

export default function RentCalculatorPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [params, setParams] = useSearchParams();

  // los datos van en la URL para poder compartir el cálculo
  const [amountText, setAmountText] = useState(params.get("monto") ? formatAmount(Number(params.get("monto"))) : "");
  const [startDate, setStartDate] = useState(params.get("inicio") ?? defaultStart());
  const [months, setMonths] = useState(Number(params.get("meses")) || 3);
  const [index, setIndex] = useState<RentIndex>(params.get("indice") === "ICL" ? "ICL" : "IPC");
  const [ipcLag, setIpcLag] = useState(params.get("rezago") === "1" ? 1 : 2);

  const [result, setResult] = useState<RentCalculation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const amount = useMemo(() => Number(amountText.replace(/\./g, "").replace(",", ".")) || 0, [amountText]);

  const problem =
    amount <= 0
      ? "Ingresá el valor inicial del alquiler."
      : !startDate
      ? "Ingresá la fecha de inicio del contrato."
      : dayjs(startDate).isAfter(dayjs())
      ? "La fecha de inicio no puede ser futura."
      : null;

  const calculate = useCallback(async () => {
    if (problem) return;
    setLoading(true);
    setError(null);
    try {
      const r = await calculateRent({ amount, startDate, months, index, ipcLag });
      setResult(r);
      setOpen(null);
      const next: Record<string, string> = { monto: String(amount), inicio: startDate, meses: String(months), indice: index };
      if (index === "IPC") next.rezago = String(ipcLag);
      setParams(next, { replace: true });
    } catch (e) {
      setResult(null);
      setError(extractApiError(e));
    } finally {
      setLoading(false);
    }
  }, [problem, amount, startDate, months, index, ipcLag, setParams]);

  // si se abrió un link compartido, se calcula solo
  useEffect(() => {
    if (params.get("monto") && params.get("inicio")) calculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // sin portapapeles no pasa nada
    }
  };

  const today = dayjs().format("YYYY-MM-DD");
  const next: RentPeriod | undefined = result?.periods.find((p) => p.date > today);

  return (
    <>
      <IconButton
        size="small"
        onClick={() => navigate(-1)}
        sx={{ position: "absolute", top: 64, left: 8, zIndex: 1300, display: { xs: "none", sm: "inline-flex" } }}
      >
        <ReplyIcon />
      </IconButton>

      <BasePage>
        <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography variant="h4" fontWeight={700} sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
              <CalculateOutlinedIcon color="primary" fontSize="large" />
              Calculadora de alquileres
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Calculá cuánto se actualiza tu alquiler por IPC o ICL, con los datos oficiales del INDEC y del BCRA.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* ---------------- formulario ---------------- */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={2.5}>
                    <TextField
                      label="Valor inicial del alquiler"
                      placeholder="Ej: 500.000"
                      value={amountText}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "").slice(0, 12);
                        setAmountText(digits ? formatAmount(Number(digits)) : "");
                      }}
                      inputProps={{ inputMode: "numeric" }}
                      InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                      fullWidth
                    />
                    <TextField
                      type="date"
                      label="Fecha de inicio del contrato"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ max: today }}
                      fullWidth
                    />

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Cada cuánto se actualiza
                      </Typography>
                      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1 }}>
                        {FREQUENCIES.map((f) => (
                          <Chip
                            key={f.value}
                            label={f.label}
                            color={months === f.value ? "primary" : "default"}
                            variant={months === f.value ? "filled" : "outlined"}
                            onClick={() => setMonths(f.value)}
                          />
                        ))}
                      </Box>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Índice de actualización
                      </Typography>
                      <ToggleButtonGroup
                        exclusive
                        fullWidth
                        color="primary"
                        value={index}
                        onChange={(_, v) => v && setIndex(v)}
                      >
                        <ToggleButton value="IPC">IPC</ToggleButton>
                        <ToggleButton value="ICL">ICL</ToggleButton>
                      </ToggleButtonGroup>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75 }}>
                        {INDEX_HELP[index]}
                      </Typography>
                    </Box>

                    {index === "IPC" && (
                      <TextField
                        select
                        size="small"
                        label="Qué meses de IPC se toman"
                        value={ipcLag}
                        onChange={(e) => setIpcLag(Number(e.target.value))}
                        helperText="Depende de lo que diga el contrato. Lo habitual es usar el último IPC publicado al momento del aumento."
                        fullWidth
                      >
                        <MenuItem value={2}>Último publicado al aumentar (2 meses antes)</MenuItem>
                        <MenuItem value={1}>Hasta el mes anterior al aumento</MenuItem>
                      </TextField>
                    )}

                    <LoadingButton
                      variant="contained"
                      size="large"
                      loading={loading}
                      disabled={Boolean(problem)}
                      onClick={calculate}
                    >
                      Calcular
                    </LoadingButton>
                    {problem && amountText && (
                      <Typography variant="caption" color="text.secondary">
                        {problem}
                      </Typography>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* ---------------- resultado ---------------- */}
            <Grid size={{ xs: 12, md: 8 }}>
              {error && <Alert severity="error">{error}</Alert>}

              {!result && !error && (
                <Card variant="outlined" sx={{ height: "100%", minHeight: 220, display: "grid", placeItems: "center", p: 3 }}>
                  <Typography color="text.secondary" textAlign="center">
                    Completá los datos del contrato y tocá <b>Calcular</b> para ver cada aumento.
                  </Typography>
                </Card>
              )}

              {result && (
                <Stack spacing={2}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Card sx={{ bgcolor: "primary.main", color: "common.white", height: "100%" }}>
                        <CardContent>
                          <Typography variant="overline" sx={{ opacity: 0.9 }}>
                            Alquiler actual
                          </Typography>
                          <Typography variant="h4" fontWeight={800}>
                            {money(result.currentAmount)}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            {pct(result.accumulatedPercent)} desde el inicio ({money(result.initialAmount)})
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Card variant="outlined" sx={{ height: "100%" }}>
                        <CardContent>
                          <Typography variant="overline" color="text.secondary">
                            Próximo aumento
                          </Typography>
                          {next ? (
                            next.pending ? (
                              <>
                                <Typography variant="h5" fontWeight={700}>
                                  {day(next.date)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ display: "flex", gap: 0.5, mt: 0.5 }}>
                                  <ScheduleIcon fontSize="small" /> {next.pendingReason}
                                </Typography>
                              </>
                            ) : (
                              <>
                                <Typography variant="h5" fontWeight={700}>
                                  {money(next.amount)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  desde el {day(next.date)} ({pct(next.variationPercent)})
                                </Typography>
                              </>
                            )
                          ) : (
                            <Typography color="text.secondary">—</Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {isMobile ? (
                    <Stack spacing={1.5}>
                      {result.periods.map((p) => (
                        <Card key={p.number} variant="outlined" sx={{ opacity: p.pending ? 0.75 : 1 }}>
                          <CardContent sx={{ pb: "12px !important" }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                              <Typography fontWeight={700}>Aumento {p.number}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {day(p.date)}
                              </Typography>
                            </Box>
                            {p.pending ? (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {p.pendingReason}
                              </Typography>
                            ) : (
                              <>
                                <Typography variant="h6" fontWeight={800} color="primary.main">
                                  {money(p.amount)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {pct(p.variationPercent)} ({p.fromLabel} → {p.toLabel}) · acumulado {pct(p.accumulatedPercent)}
                                </Typography>
                              </>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  ) : (
                    <TableContainer component={Card} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Aumento</TableCell>
                            <TableCell>Fecha</TableCell>
                            <TableCell>{result.index === "IPC" ? "IPC" : "ICL"} usado</TableCell>
                            <TableCell align="right">Variación</TableCell>
                            <TableCell align="right">Nuevo alquiler</TableCell>
                            <TableCell align="right">Acumulado</TableCell>
                            {result.index === "IPC" && <TableCell />}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {result.periods.map((p) => (
                            <Fragment key={p.number}>
                              <TableRow hover sx={{ opacity: p.pending ? 0.7 : 1 }}>
                                <TableCell>{p.number}</TableCell>
                                <TableCell>{day(p.date)}</TableCell>
                                <TableCell>
                                  {p.fromLabel} → {p.toLabel}
                                </TableCell>
                                {p.pending ? (
                                  <TableCell colSpan={result.index === "IPC" ? 4 : 3}>
                                    <Typography variant="body2" color="text.secondary">
                                      {p.pendingReason}
                                    </Typography>
                                  </TableCell>
                                ) : (
                                  <>
                                    <TableCell align="right">{pct(p.variationPercent)}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                                      {money(p.amount)}
                                    </TableCell>
                                    <TableCell align="right">{pct(p.accumulatedPercent)}</TableCell>
                                    {result.index === "IPC" && (
                                      <TableCell padding="checkbox">
                                        <Tooltip title="Ver mes por mes">
                                          <IconButton size="small" onClick={() => setOpen(open === p.number ? null : p.number)}>
                                            <KeyboardArrowDownIcon
                                              fontSize="small"
                                              sx={{ transform: open === p.number ? "rotate(180deg)" : "none", transition: "transform .2s" }}
                                            />
                                          </IconButton>
                                        </Tooltip>
                                      </TableCell>
                                    )}
                                  </>
                                )}
                              </TableRow>
                              {result.index === "IPC" && !p.pending && (
                                <TableRow>
                                  <TableCell colSpan={7} sx={{ py: 0, borderBottom: open === p.number ? undefined : "none" }}>
                                    <Collapse in={open === p.number} unmountOnExit>
                                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, py: 1.5 }}>
                                        {p.months.map((m) => (
                                          <Chip key={m.label} size="small" variant="outlined" label={`${m.label}: ${pct(m.percent)}`} />
                                        ))}
                                      </Box>
                                    </Collapse>
                                  </TableCell>
                                </TableRow>
                              )}
                            </Fragment>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}

                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center", justifyContent: "space-between" }}>
                    <Typography variant="caption" color="text.secondary">
                      Fuente: {result.source}. Datos publicados hasta {result.dataUpdatedTo}.
                    </Typography>
                    <Button size="small" startIcon={<LinkIcon />} onClick={copyLink}>
                      {copied ? "¡Link copiado!" : "Copiar link del cálculo"}
                    </Button>
                  </Box>

                  <Alert severity="info" variant="outlined">
                    Cálculo orientativo. El índice y la forma de actualizar los define el contrato. ¿Tenés dudas con tu alquiler?{" "}
                    <Button size="small" onClick={() => navigate(ROUTES.CONTACT)} sx={{ p: 0, minWidth: 0, verticalAlign: "baseline" }}>
                      Consultanos
                    </Button>
                  </Alert>
                </Stack>
              )}
            </Grid>
          </Grid>
        </Container>
      </BasePage>
    </>
  );
}
