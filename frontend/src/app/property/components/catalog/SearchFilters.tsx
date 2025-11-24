import { useState, useMemo } from "react";
import {
  Box,
  Button,
  Drawer,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  Chip,
  Typography,
  Slider,
  useTheme,
  useMediaQuery,
  IconButton,
  Card,
} from "@mui/material";
import RadioGroup from "@mui/material/RadioGroup";
import Radio from "@mui/material/Radio";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import { LoadingButton } from "@mui/lab";
import { useSearchFilters } from "../../hooks/useSearchFilters";
import type { Property } from "../../types/property";
import { formatAmount } from "../../../shared/utils/numberFormat";
import { useBackButtonClose } from "../../../shared/hooks/useBackButtonClose";

interface Props {
  onSearch(results: Property[]): void;
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
  hideMobileTrigger?: boolean;
}

/* ───── estilos reutilizables ───── */
const checkSx = {
  px: 0.5,
  ".MuiFormControlLabel-label": { fontSize: "0.8rem" },
  "& .MuiCheckbox-root": { p: 0.3 },
};

const radioSx = {
  px: 0.5,
  ".MuiFormControlLabel-label": { fontSize: "0.9rem" },
  "& .MuiRadio-root": { p: 0.3, transform: "scale(.85)" },
};

const accordionSx = {
  boxShadow: "none",
  bgcolor: "transparent",
  border: "none",
  borderBottom: "1px solid",
  borderColor: "divider",
  "&:before": { display: "none" },
};

const scrollableDetailsSx = {
  px: 1,
  mx: 1,
  display: "flex",
  flexWrap: "wrap",
  gap: 0.2,
  maxHeight: 150,
  overflowY: "auto",
  pr: 1,
};

export const SearchFilters = ({ onSearch, mobileOpen, onMobileOpenChange, hideMobileTrigger }: Props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [internalOpen, setInternalOpen] = useState(false);
  const open = typeof mobileOpen === "boolean" ? mobileOpen : internalOpen;
  const setOpen = (v: boolean) => {
    if (onMobileOpenChange) onMobileOpenChange(v);
    else setInternalOpen(v);
  };
  const closeWithBack = useBackButtonClose(isMobile && open, () => setOpen(false));

  const [expanded, setExpanded] = useState<string | false>(false);
  const toggleAcc = (p: string) => (_: unknown, ex: boolean) => setExpanded(ex ? p : false);

  const operationsOptions = ["VENTA", "ALQUILER"];

  const {
    params,
    dynLimits,
    typesList = [],
    amenitiesList = [],
    neighborhoodsList = [],
    toggleParam,
    setParams,
    apply,
    reset,
    chips,
    toggleAmenity,
    selected,
    isApplying,
  } = useSearchFilters(onSearch);

  const cities = useMemo(
    () => Array.from(new Set(neighborhoodsList.map((n) => n.city).filter(Boolean))),
    [neighborhoodsList]
  );

  const priceCfg = dynLimits.price[(params.currency || "USD") as "USD" | "ARS"] ?? dynLimits.price.USD;

  const sortedTypes = useMemo(() => [...typesList].sort((a, b) => a.name.localeCompare(b.name)), [typesList]);

  const sortedAmenities = useMemo(
    () => [...amenitiesList].sort((a, b) => a.name.localeCompare(b.name)),
    [amenitiesList]
  );

  const sortedCities = useMemo(() => cities.slice().sort((a, b) => a.localeCompare(b)), [cities]);

  const sortedNeighborhoods = useMemo(
    () =>
      [...neighborhoodsList].sort((a, b) => {
        const nameCompare = a.name.localeCompare(b.name);
        if (nameCompare !== 0) return nameCompare;
        return (a.city ?? "").localeCompare(b.city ?? "");
      }),
    [neighborhoodsList]
  );

  /* ═════════ Panel completo ═════════ */
  const Panel = (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      {isMobile ? (
        <Box display="flex" justifyContent="space-between" alignItems="center" p={2} mb={2}>
          <Typography variant="subtitle1" fontSize={"1.2rem"} fontWeight={600}>
            Filtros de Búsqueda
          </Typography>
          <IconButton size="small" onClick={() => closeWithBack()}>
            <CloseIcon />
          </IconButton>
        </Box>
      ) : (
        <Typography variant="h6" align="center" fontWeight={700} sx={{ mb: 2 }}>
          Filtros de Búsqueda
        </Typography>
      )}

      {/* ───────── Operación ───────── */}
      <Accordion disableGutters expanded={expanded === "operacion"} onChange={toggleAcc("operacion")} sx={accordionSx}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2">Operación</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 1, display: "flex", flexWrap: "wrap", mx: 1 }}>
          <RadioGroup row>
            {operationsOptions.map((op) => (
              <FormControlLabel
                key={op}
                label={op === "VENTA" ? "Venta" : "Alquiler"}
                sx={radioSx}
                control={
                  <Radio size="small" checked={params.operation === op} onClick={() => toggleParam("operation", op)} />
                }
              />
            ))}
          </RadioGroup>

          {params.operation === "VENTA" && (
            <Box sx={{ mt: 1, width: "100%" }}>
              <Typography variant="caption" sx={{ fontWeight: 500 }}>
                Opciones de Pago
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 0.5,
                  mt: 0.5,
                  pl: 2,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox size="small" checked={params.credit} onChange={() => toggleParam("credit", true)} />
                  }
                  label="Apto Crédito"
                  sx={checkSx}
                />
                <FormControlLabel
                  control={
                    <Checkbox size="small" checked={params.financing} onChange={() => toggleParam("financing", true)} />
                  }
                  label="Financiamiento"
                  sx={checkSx}
                />
              </Box>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      {/* ───────── Tipo ───────── */}
      <Accordion disableGutters expanded={expanded === "tipo"} onChange={toggleAcc("tipo")} sx={accordionSx}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2">Tipos de Propiedad</Typography>
        </AccordionSummary>
        <AccordionDetails sx={scrollableDetailsSx}>
          {sortedTypes.map((tp) => (
            <FormControlLabel
              key={tp.name}
              control={
                <Checkbox
                  size="small"
                  checked={params.types.includes(tp.name)}
                  onChange={() => toggleParam("types", tp.name)}
                />
              }
              label={tp.name}
              sx={checkSx}
            />
          ))}
        </AccordionDetails>
      </Accordion>

      {/* ───────── Ambientes ───────── */}
      <Accordion disableGutters expanded={expanded === "amb"} onChange={toggleAcc("amb")} sx={accordionSx}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2">Números de Ambientes</Typography>
        </AccordionSummary>
        <AccordionDetails sx={scrollableDetailsSx}>
          {[1, 2, 3].map((n) => (
            <FormControlLabel
              key={n}
              control={
                <Checkbox size="small" checked={params.rooms.includes(n)} onChange={() => toggleParam("rooms", n)} />
              }
              label={n === 3 ? "3+" : n.toString()}
              sx={checkSx}
            />
          ))}
        </AccordionDetails>
      </Accordion>

      {/* ───────── Precio ───────── */}
      <Accordion disableGutters expanded={expanded === "precio"} onChange={toggleAcc("precio")} sx={accordionSx}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2">Precio</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 1, display: "flex", flexWrap: "wrap", mx: 1 }}>
          <RadioGroup row sx={{ mb: 1 }}>
            {["USD", "ARS"].map((curr) => (
              <FormControlLabel
                key={curr}
                label={curr === "USD" ? "Dólar" : "Peso Argentino"}
                sx={radioSx}
                control={
                  <Radio
                    size="small"
                    checked={params.currency === curr}
                    onClick={() => toggleParam("currency", curr)}
                  />
                }
              />
            ))}
          </RadioGroup>

          <Slider
            sx={{ mx: 3 }}
            disabled={!params.currency}
            value={params.priceRange}
            onChange={(_, v) => setParams({ ...params, priceRange: v as [number, number] })}
            min={priceCfg.min}
            max={priceCfg.max}
            step={priceCfg.step}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => formatAmount(value as number)}
            marks={
              params.currency
                ? [
                    { value: priceCfg.min, label: "0" },
                    {
                      value: priceCfg.max,
                      label: formatAmount(priceCfg.max),
                    },
                  ]
                : false
            }
            size="small"
          />

          {!params.currency && (
            <Typography variant="caption" color="text.secondary" sx={{ width: "100%", textAlign: "center" }}>
              Seleccione una moneda para habilitar
            </Typography>
          )}
        </AccordionDetails>
      </Accordion>

      {/* ───────── Superficie ───────── */}
      <Accordion disableGutters expanded={expanded === "sup"} onChange={toggleAcc("sup")} sx={accordionSx}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2">Superficie (Total / Cubierta)</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 1, display: "flex", flexWrap: "wrap", mx: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Total (m²)
          </Typography>
          <Slider
            sx={{ mx: 3, mb: 2 }}
            value={params.areaRange}
            onChange={(_, v) => setParams({ ...params, areaRange: v as [number, number] })}
            min={dynLimits.area.min}
            max={dynLimits.area.max}
            step={dynLimits.area.step}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => formatAmount(value)}
            marks={[
              { value: dynLimits.area.min, label: "0" },
              {
                value: dynLimits.area.max,
                label: formatAmount(dynLimits.area.max),
              },
            ]}
            size="small"
          />

          <Typography variant="caption" color="text.secondary">
            Cubierta (m²)
          </Typography>
          <Slider
            sx={{ mx: 3 }}
            value={params.coveredRange}
            onChange={(_, v) => setParams({ ...params, coveredRange: v as [number, number] })}
            min={dynLimits.covered.min}
            max={dynLimits.covered.max}
            step={dynLimits.covered.step}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => formatAmount(value)}
            marks={[
              { value: dynLimits.covered.min, label: "0" },
              {
                value: dynLimits.covered.max,
                label: formatAmount(dynLimits.covered.max),
              },
            ]}
            size="small"
          />
        </AccordionDetails>
      </Accordion>

      {/* ───────── Características ───────── */}
      <Accordion disableGutters expanded={expanded === "carac"} onChange={toggleAcc("carac")} sx={accordionSx}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2">Características</Typography>
        </AccordionSummary>

        <AccordionDetails sx={scrollableDetailsSx}>
          {sortedAmenities.map((am) => (
            <FormControlLabel
              key={am.id}
              control={
                <Checkbox
                  size="small"
                  checked={selected.amenities.includes(am.id)}
                  onChange={() => toggleAmenity(am.id)}
                />
              }
              label={am.name}
              sx={checkSx}
            />
          ))}
        </AccordionDetails>
      </Accordion>

      {/* ───────── Ciudad ───────── */}
      <Accordion disableGutters expanded={expanded === "ciudad"} onChange={toggleAcc("ciudad")} sx={accordionSx}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2">Ciudades</Typography>
        </AccordionSummary>
        <AccordionDetails sx={scrollableDetailsSx}>
          {sortedCities.map((city) => (
            <FormControlLabel
              key={city}
              control={
                <Checkbox
                  size="small"
                  checked={params.cities.includes(city)}
                  onChange={() => toggleParam("cities", city)}
                />
              }
              label={city}
              sx={checkSx}
            />
          ))}
        </AccordionDetails>
      </Accordion>

      {/* ───────── Barrio ───────── */}
      <Accordion disableGutters expanded={expanded === "barrio"} onChange={toggleAcc("barrio")} sx={accordionSx}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2">Barrios</Typography>
        </AccordionSummary>
        <AccordionDetails sx={scrollableDetailsSx}>
          {sortedNeighborhoods.map((nb) => (
            <FormControlLabel
              key={nb.name}
              control={
                <Checkbox
                  size="small"
                  checked={params.neighborhoods.includes(nb.name)}
                  onChange={() => toggleParam("neighborhoods", nb.name)}
                  disabled={params.cities.length > 0 && !params.cities.includes(nb.city)}
                />
              }
              label={nb.name}
              sx={checkSx}
            />
          ))}
        </AccordionDetails>
      </Accordion>

      {/* chips */}
      {chips.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, my: 1 }}>
          {chips.map((c) => (
            <Chip key={c.label} label={c.label} onDelete={c.onClear} size="small" />
          ))}
        </Box>
      )}

      <Box
        sx={{
          mt: 2,
          display: "flex",
          gap: 1,
          alignItems: "stretch",
          "& > *": { flex: 1 },
        }}
      >
        <LoadingButton
          variant="outlined"
          onClick={reset}
          sx={{ fontSize: ".75rem", py: 0.5 }}
          data-testid="filters-reset-button"
        >
          Limpiar filtros
        </LoadingButton>
        <LoadingButton
          variant="contained"
          onClick={() => apply()}
          loading={isApplying}
          sx={{ fontSize: ".75rem", py: 0.5 }}
          data-testid="filters-search-button"
        >
          Filtrar
        </LoadingButton>
      </Box>
    </Box>
  );

  /* ═════════ Render con Drawer o fijo ═════════ */
  return isMobile ? (
    <>
      {/* Botón interno solo si NO lo ocultamos */}
      {!hideMobileTrigger && (
        <Button variant="outlined" startIcon={<FilterListIcon />} onClick={() => setOpen(true)} sx={{ py: 0.5 }}>
          Filtros
        </Button>
      )}

      <Drawer
        anchor="bottom"
        open={open}
        onClose={closeWithBack}
        PaperProps={{
          sx: (theme) => ({
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: "0px 12px 32px rgba(15, 23, 42, 0.08)",
            height: "75vh",
            maxHeight: "90vh",
            m: 0,
          }),
        }}
      >
        <Box sx={{ height: "100%", overflowY: "scroll", scrollbarGutter: "stable" }}>{Panel}</Box>
      </Drawer>
    </>
  ) : (
    <Box sx={{ width: 300, mt: 2 }}>
      <Card sx={{ overflow: "hidden" }}>{Panel}</Card>
    </Box>
  );
};
