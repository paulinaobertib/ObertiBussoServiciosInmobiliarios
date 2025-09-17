import { useState, useMemo } from "react";
import {
  Box, Button, Drawer, Accordion, AccordionSummary, AccordionDetails, Checkbox, FormControlLabel,
  Chip, Typography, Divider, Slider, useTheme, useMediaQuery, IconButton,
} from "@mui/material";
import RadioGroup from "@mui/material/RadioGroup";
import Radio from "@mui/material/Radio";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import { LoadingButton } from "@mui/lab";
import { useSearchFilters } from "../../hooks/useSearchFilters";
import type { Property } from "../../types/property";

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

export const SearchFilters = ({ onSearch, mobileOpen, onMobileOpenChange, hideMobileTrigger }: Props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [internalOpen, setInternalOpen] = useState(false);
  const open = typeof mobileOpen === "boolean" ? mobileOpen : internalOpen;
  const setOpen = (v: boolean) => {
    if (onMobileOpenChange) onMobileOpenChange(v);
    else setInternalOpen(v);
  };

  const [expanded, setExpanded] = useState<string | false>(false);
  const toggleAcc =
    (p: string) => (_: unknown, ex: boolean) => setExpanded(ex ? p : false);

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
  } = useSearchFilters(onSearch);

  const cities = useMemo(
    () =>
      Array.from(new Set(neighborhoodsList.map(n => n.city).filter(Boolean))),
    [neighborhoodsList]
  );

  const priceCfg =
    dynLimits.price[
    (params.currency || "USD") as "USD" | "ARS"
    ] ?? dynLimits.price.USD;

  /* ═════════ Panel completo ═════════ */
  const Panel = (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      {isMobile ? (
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          p={2}
          mb={2}
        >
          <Typography variant="subtitle1" fontSize={'1.2rem'} fontWeight={600}>Filtros de Búsqueda</Typography>
          <IconButton size="small" onClick={() => setOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
      ) : (
        <Typography
          variant="h6"
          align="center"
          fontWeight={700}
          sx={{ mb: 2 }}
        >
          Filtros de Búsqueda
        </Typography>
      )}

      {/* ───────── Operación ───────── */}
      <Accordion
        disableGutters
        expanded={expanded === "operacion"}
        onChange={toggleAcc("operacion")}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2">Operación</Typography>
        </AccordionSummary>
        <AccordionDetails
          sx={{ px: 1, display: "flex", flexWrap: "wrap", mx: 1 }}
        >
          <RadioGroup row>
            {operationsOptions.map(op => (
              <FormControlLabel
                key={op}
                label={op === "VENTA" ? "Venta" : "Alquiler"}
                sx={radioSx}
                control={
                  <Radio
                    size="small"
                    checked={params.operation === op}
                    onClick={() => toggleParam("operation", op)}
                  />
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
                    <Checkbox
                      size="small"
                      checked={params.credit}
                      onChange={() => toggleParam("credit", true)}
                    />
                  }
                  label="Apto Crédito"
                  sx={checkSx}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={params.financing}
                      onChange={() => toggleParam("financing", true)}
                    />
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
      <Accordion
        disableGutters
        expanded={expanded === "tipo"}
        onChange={toggleAcc("tipo")}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2">Tipos de Propiedad</Typography>
        </AccordionSummary>
        <AccordionDetails
          sx={{ px: 1, display: "flex", flexWrap: "wrap", mx: 1 }}
        >
          {typesList.map(tp => (
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
      <Accordion
        disableGutters
        expanded={expanded === "amb"}
        onChange={toggleAcc("amb")}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2">Números de Ambientes</Typography>
        </AccordionSummary>
        <AccordionDetails
          sx={{ px: 1, display: "flex", flexWrap: "wrap", mx: 1 }}
        >
          {[1, 2, 3].map(n => (
            <FormControlLabel
              key={n}
              control={
                <Checkbox
                  size="small"
                  checked={params.rooms.includes(n)}
                  onChange={() => toggleParam("rooms", n)}
                />
              }
              label={n === 3 ? "3+" : n.toString()}
              sx={checkSx}
            />
          ))}
        </AccordionDetails>
      </Accordion>

      {/* ───────── Precio ───────── */}
      <Accordion
        disableGutters
        expanded={expanded === "precio"}
        onChange={toggleAcc("precio")}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2">Precio</Typography>
        </AccordionSummary>
        <AccordionDetails
          sx={{ px: 1, display: "flex", flexWrap: "wrap", mx: 1 }}
        >
          <RadioGroup row sx={{ mb: 1 }}>
            {["USD", "ARS"].map(curr => (
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
            onChange={(_, v) =>
              setParams({ ...params, priceRange: v as [number, number] })
            }
            onChangeCommitted={() => apply()}
            min={priceCfg.min}
            max={priceCfg.max}
            step={priceCfg.step}
            valueLabelDisplay="auto"
            marks={
              params.currency
                ? [
                  { value: priceCfg.min, label: "0" },
                  {
                    value: priceCfg.max,
                    label: priceCfg.max.toLocaleString(),
                  },
                ]
                : false
            }
            size="small"
          />

          {!params.currency && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ width: "100%", textAlign: "center" }}
            >
              Seleccione una moneda para habilitar
            </Typography>
          )}
        </AccordionDetails>
      </Accordion>

      {/* ───────── Superficie ───────── */}
      <Accordion
        disableGutters
        expanded={expanded === "sup"}
        onChange={toggleAcc("sup")}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2">Superficie (Total / Cubierta)</Typography>
        </AccordionSummary>
        <AccordionDetails
          sx={{ px: 1, display: "flex", flexWrap: "wrap", mx: 1 }}
        >
          <Typography variant="caption" color="text.secondary">
            Total (m²)
          </Typography>
          <Slider
            sx={{ mx: 3, mb: 2 }}
            value={params.areaRange}
            onChange={(_, v) =>
              setParams({ ...params, areaRange: v as [number, number] })
            }
            onChangeCommitted={() => apply()}
            min={dynLimits.surface.min}
            max={dynLimits.surface.max}
            step={dynLimits.surface.step}
            valueLabelDisplay="auto"
            marks={[
              { value: dynLimits.surface.min, label: "0" },
              {
                value: dynLimits.surface.max,
                label: dynLimits.surface.max.toLocaleString(),
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
            onChange={(_, v) =>
              setParams({ ...params, coveredRange: v as [number, number] })
            }
            onChangeCommitted={() => apply()}
            min={dynLimits.surface.min}
            max={dynLimits.surface.max}
            step={dynLimits.surface.step}
            valueLabelDisplay="auto"
            marks={[
              { value: dynLimits.surface.min, label: "0" },
              {
                value: dynLimits.surface.max,
                label: dynLimits.surface.max.toLocaleString(),
              },
            ]}
            size="small"
          />
        </AccordionDetails>
      </Accordion>

      {/* ───────── Características ───────── */}
      <Accordion
        disableGutters
        expanded={expanded === "carac"}
        onChange={toggleAcc("carac")}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2">Características</Typography>
        </AccordionSummary>

        <AccordionDetails
          sx={{ px: 1, display: "flex", flexWrap: "wrap", mx: 1 }}
        >
          {amenitiesList.map(am => (
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
      <Accordion
        disableGutters
        expanded={expanded === "ciudad"}
        onChange={toggleAcc("ciudad")}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2">Ciudades</Typography>
        </AccordionSummary>
        <AccordionDetails
          sx={{ px: 1, display: "flex", flexWrap: "wrap", mx: 1 }}
        >
          {cities.map(city => (
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
      <Accordion
        disableGutters
        expanded={expanded === "barrio"}
        onChange={toggleAcc("barrio")}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2">Barrios</Typography>
        </AccordionSummary>
        <AccordionDetails
          sx={{ px: 1, display: "flex", flexWrap: "wrap", mx: 1 }}
        >
          {neighborhoodsList.map(nb => (
            <FormControlLabel
              key={nb.name}
              control={
                <Checkbox
                  size="small"
                  checked={params.neighborhoods.includes(nb.name)}
                  onChange={() => toggleParam("neighborhoods", nb.name)}
                  disabled={
                    params.cities.length > 0 && !params.cities.includes(nb.city)
                  }
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
          {chips.map(c => (
            <Chip key={c.label} label={c.label} onDelete={c.onClear} size="small" />
          ))}
        </Box>
      )}

      <Divider sx={{ my: 2 }} />
      <LoadingButton
        fullWidth
        variant="outlined"
        onClick={reset}
        sx={{ fontSize: ".75rem", py: 0.5 }}
      >
        Limpiar filtros
      </LoadingButton>
    </Box>
  );

  /* ═════════ Render con Drawer o fijo ═════════ */
  return isMobile ? (
    <>
      {/* Botón interno solo si NO lo ocultamos */}
      {!hideMobileTrigger && (
        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          onClick={() => setOpen(true)}
          sx={{ py: 0.5 }}
        >
          Filtros
        </Button>
      )}

      <Drawer
        anchor="bottom"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: { height: "75vh", borderTopLeftRadius: 12, borderTopRightRadius: 12 },
        }}
      >
        {Panel}
      </Drawer>
    </>
  ) : (
    <Box sx={{ width: 300, borderColor: "divider" }}>{Panel}</Box>
  );
};