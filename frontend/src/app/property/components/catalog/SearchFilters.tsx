import { useState } from 'react';
import {
  Box, Button, Drawer, Accordion, AccordionSummary, AccordionDetails,
  Checkbox, FormControlLabel, Chip, Typography, Divider, Slider, useTheme, useMediaQuery, IconButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import { LoadingButton } from '@mui/lab';
import { useSearchFilters } from '../../hooks/useSearchFilters';
import type { Property } from '../../types/property';

interface Props {
  onSearch(results: Property[]): void;
}

export const SearchFilters = ({ onSearch }: Props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(false);

  const {
    params,
    selected,
    operationsList,
    typesList,
    amenitiesList,
    neighborhoodsList,
    toggleParam,
    toggleAmenity,
    reset,
    chips,
    setParams,
    apply,
  } = useSearchFilters(onSearch);

  const Panel = (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      {isMobile ? (
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="subtitle1">Filtros de Búsqueda</Typography>
          <IconButton size="small" onClick={() => setOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
      ) : (
        <Typography variant="h6" align="center" fontWeight={700} sx={{ mb: 2 }}>
          Filtros de Búsqueda
        </Typography>
      )}

      {/* Operación */}
      <Accordion disableGutters>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2">Operación</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 1 }}>
          {operationsList.map((op) => (
            <FormControlLabel
              key={op}
              control={
                <Checkbox
                  size="small"
                  checked={params.operation === op}
                  onChange={() => toggleParam('operation', op)}
                />
              }
              label={op}
            />
          ))}
        </AccordionDetails>
      </Accordion>

      {/* Tipo */}
      <Accordion disableGutters>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2">Tipo</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 1 }}>
          {typesList.map((tp) => (
            <FormControlLabel
              key={tp.name}
              control={
                <Checkbox
                  size="small"
                  checked={params.type === tp.name}
                  onChange={() => toggleParam('type', tp.name)}
                />
              }
              label={tp.name}
            />
          ))}
        </AccordionDetails>
      </Accordion>

      {/* Ambientes */}
      <Accordion disableGutters>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2">Ambientes</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 1 }}>
          {[1, 2, 3].map((n) => (
            <FormControlLabel
              key={n}
              control={
                <Checkbox
                  size="small"
                  checked={params.rooms === n}
                  onChange={() => toggleParam('rooms', n)}
                />
              }
              label={n === 3 ? '3+' : n.toString()}
            />
          ))}
        </AccordionDetails>
      </Accordion>

      {/* Precio */}
      <Accordion disableGutters>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2">Precio</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 1 }}>
          <Slider
            value={params.priceRange}
            onChange={(_, v) =>
              setParams({ ...params, priceRange: v as [number, number] })
            }
            onChangeCommitted={() => apply()}
            min={0}
            max={1_000_000}
            step={50_000}
            valueLabelDisplay="auto"
            size="small"
          />
        </AccordionDetails>
      </Accordion>

      {/* Superficie */}
      <Accordion disableGutters>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2">Superficie</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 1 }}>
          <Slider
            value={params.areaRange}
            onChange={(_, v) =>
              setParams({ ...params, areaRange: v as [number, number] })
            }
            onChangeCommitted={() => apply()}
            min={0}
            max={1_000}
            step={50}
            valueLabelDisplay="auto"
            size="small"
          />
        </AccordionDetails>
      </Accordion>

      {/* Superficie Cubierta */}
      <Accordion disableGutters>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2">Superficie Cubierta</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 1 }}>
          <Slider
            value={params.coveredRange}
            onChange={(_, v) =>
              setParams({ ...params, coveredRange: v as [number, number] })
            }
            onChangeCommitted={() => apply()}
            min={0}
            max={1_000}
            step={50}
            valueLabelDisplay="auto"
            size="small"
          />
        </AccordionDetails>
      </Accordion>

      {/* Características */}
      <Accordion disableGutters>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2">Características</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 1, display: 'flex', flexDirection: 'column' }}>
          {amenitiesList.map((am) => (
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
            />
          ))}
        </AccordionDetails>
      </Accordion>

      {/* Ciudad */}
      <Accordion disableGutters>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2">Ciudad</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 1 }}>
          {Array.from(new Set(neighborhoodsList.map((n) => n.city))).map(
            (city) => (
              <FormControlLabel
                key={city}
                control={
                  <Checkbox
                    size="small"
                    checked={params.city === city}
                    onChange={() => toggleParam('city', city)}
                  />
                }
                label={city}
              />
            )
          )}
        </AccordionDetails>
      </Accordion>

      {/* Barrio */}
      <Accordion disableGutters>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2">Barrio</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 1 }}>
          {neighborhoodsList.map((nb) => (
            <FormControlLabel
              key={nb.name}
              control={
                <Checkbox
                  size="small"
                  checked={params.neighborhood === nb.name}
                  onChange={() => toggleParam('neighborhood', nb.name)}
                />
              }
              label={nb.name}
            />
          ))}
        </AccordionDetails>
      </Accordion>

      {/* Chips activos */}
      {chips.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, my: 1 }}>
          {chips.map((c) => (
            <Chip key={c.label} label={c.label} onDelete={c.onClear} size="small" />
          ))}
        </Box>
      )}

      <Divider sx={{ my: 2 }} />
      <LoadingButton
        fullWidth
        variant="outlined"
        onClick={reset}
        sx={{ fontSize: '0.875rem', py: 0.5 }}
      >
        Reset filtros
      </LoadingButton>
    </Box>
  );

  return isMobile ? (
    <>
      <Button
        variant="outlined"
        startIcon={<FilterListIcon />}
        onClick={() => setOpen(true)}
        sx={{ fontSize: '0.875rem', py: 0.5 }}
      >
        Filtros
      </Button>
      <Drawer
        anchor="bottom"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: { height: '80vh', borderTopLeftRadius: 12, borderTopRightRadius: 12 },
        }}
      >
        {Panel}
      </Drawer>
    </>
  ) : (
    <Box
      sx={{
        width: 300,
        flexShrink: 0,
        borderLeft: '1px solid',
        borderColor: 'divider',
      }}
    >
      {Panel}
    </Box>
  );
};
