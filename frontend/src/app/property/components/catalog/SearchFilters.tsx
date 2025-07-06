import { useMemo, useState } from 'react';
import {
  Box, Button, Drawer, Accordion, AccordionSummary, AccordionDetails,
  Checkbox, FormControlLabel, Chip, Typography, Divider, Slider, useTheme, useMediaQuery, IconButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import { LoadingButton } from '@mui/lab';
import { Property } from '../../types/property';
import { SearchParams } from '../../types/searchParams';
import { usePropertyCrud } from '../../context/PropertiesContext';
import { getPropertiesByFilters } from '../../services/property.service';
import { useLoading } from '../../utils/useLoading';

interface Props { onSearch(results: Property[]): void; }

export const SearchFilters = ({ onSearch }: Props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const {
    operationsList,
    typesList,
    amenitiesList,
    neighborhoodsList,
    selected,
    setSelected,
    buildSearchParams,
  } = usePropertyCrud();

  // Slider limits
  const PRICE_MAX = 1000000;
  const AREA_MAX = 1000;
  const COVERED_MAX = 1000;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [params, setParams] = useState<{
    operation?: string;
    type?: string;
    rooms?: number;
    city?: string;
    neighborhood?: string;
    priceRange: number[];
    areaRange: number[];
    coveredRange: number[];
    credit?: boolean;
    financing?: boolean;
  }>({
    priceRange: [0, PRICE_MAX],
    areaRange: [0, AREA_MAX],
    coveredRange: [0, COVERED_MAX],
  });

  // Core search logic
  const autoSearch = async (p = params, sel = selected) => {
    const base: Partial<SearchParams> = {
      operation: p.operation ?? '',
      type: p.type ?? '',
      city: p.city ?? '',
      neighborhood: p.neighborhood ?? '',
      priceFrom: p.priceRange[0],
      priceTo: p.priceRange[1],
      areaFrom: p.areaRange[0],
      areaTo: p.areaRange[1],
      coveredAreaFrom: p.coveredRange[0],
      coveredAreaTo: p.coveredRange[1],
      amenities: sel.amenities.map(String),
      credit: p.operation === 'VENTA' && p.credit ? true : undefined,
      financing: p.operation === 'VENTA' && p.financing ? true : undefined,
    };

    let results: Property[];
    if (p.rooms === 3) {
      const filtersNoRooms = buildSearchParams(base);
      const all = await getPropertiesByFilters(filtersNoRooms as SearchParams);
      results = all.filter(r => Number(r.rooms) >= 3);
    } else if (p.rooms && p.rooms > 0) {
      const sp = buildSearchParams({ ...base, rooms: p.rooms });
      results = await getPropertiesByFilters(sp as SearchParams);
    } else {
      const filters = buildSearchParams(base);
      results = await getPropertiesByFilters(filters as SearchParams);
    }

    onSearch(results);
  };

  // Toggle single-valued param
  const toggleParam = <K extends keyof typeof params>(key: K, value: typeof params[K]) => {
    const nextVal = params[key] === value ? undefined : value;
    const next = { ...params, [key]: nextVal };
    setParams(next);
    autoSearch(next, selected);
  };

  // Generic reset
  const { run: runReset, loading: loadingReset } = useLoading(async () => {
    setParams({
      priceRange: [0, PRICE_MAX],
      areaRange: [0, AREA_MAX],
      coveredRange: [0, COVERED_MAX],
    });
    setSelected({ owner: null, neighborhood: null, type: null, amenities: [] });
    onSearch(await getPropertiesByFilters(buildSearchParams({}) as SearchParams));
    if (isMobile) setDrawerOpen(false);
  });

  // Chips
  const chips = useMemo(() => {
    const list: { label: string; clear(): void }[] = [];
    if (params.operation)
      list.push({ label: params.operation, clear: () => toggleParam('operation', params.operation!) });
    if (params.operation === 'VENTA' && params.credit)
      list.push({ label: 'Apto Crédito', clear: () => toggleParam('credit', params.credit!) });
    if (params.operation === 'VENTA' && params.financing)
      list.push({ label: 'Apto Financiamiento', clear: () => toggleParam('financing', params.financing!) });
    if (params.type)
      list.push({ label: params.type, clear: () => toggleParam('type', params.type!) });
    if (params.rooms)
      list.push({ label: `${params.rooms === 3 ? '3+' : params.rooms} amb`, clear: () => toggleParam('rooms', params.rooms!) });
    if (params.city)
      list.push({ label: params.city, clear: () => toggleParam('city', params.city!) });
    if (params.neighborhood)
      list.push({ label: params.neighborhood, clear: () => toggleParam('neighborhood', params.neighborhood!) });
    if (params.priceRange[0] > 0 || params.priceRange[1] < PRICE_MAX)
      list.push({ label: `Precio: ${params.priceRange[0]}–${params.priceRange[1]}`, clear: () => runReset() });
    if (params.areaRange[0] > 0 || params.areaRange[1] < AREA_MAX)
      list.push({ label: `Sup: ${params.areaRange[0]}–${params.areaRange[1]}`, clear: () => runReset() });
    if (params.coveredRange[0] > 0 || params.coveredRange[1] < COVERED_MAX)
      list.push({ label: `Cubierta: ${params.coveredRange[0]}–${params.coveredRange[1]}`, clear: () => runReset() });
    if (selected.amenities.length)
      list.push({ label: `${selected.amenities.length} caracts`, clear: () => { const ns = { ...selected, amenities: [] }; setSelected(ns); autoSearch(params, ns); } });
    return list;
  }, [params, selected]);

  const Panel = (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      {isMobile ? (
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="subtitle1" align="center">Filtros de Búsqueda</Typography>
          <IconButton size="small" onClick={() => setDrawerOpen(false)}><CloseIcon /></IconButton>
        </Box>
      ) : (
        <Typography variant="subtitle1" align="center" sx={{ mb: 2 }}>Filtros de Búsqueda</Typography>
      )}

      {/* Operation */}
      <Accordion disableGutters>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} >
          <Typography variant="body2">Operación</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 1 }}>
          {operationsList.map(op => (
            <Box key={op} sx={{ mb: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={params.operation === op}
                    onChange={() => toggleParam('operation', op)}
                  />
                }
                label={op}
              />
              {op === 'VENTA' && params.operation === 'VENTA' && (
                <Box sx={{ pl: 4, mt: 1 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={!!params.credit}
                        onChange={() => toggleParam('credit', !params.credit)}
                      />
                    }
                    label="Apto Crédito"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={!!params.financing}
                        onChange={() => toggleParam('financing', !params.financing)}
                      />
                    }
                    label="Apto Financiamiento"
                  />
                </Box>
              )}
            </Box>
          ))}
        </AccordionDetails>
      </Accordion>

      {/* Tipo */}
      <Accordion disableGutters>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography variant="body2">Tipo</Typography></AccordionSummary>
        <AccordionDetails sx={{ p: 1 }}>
          {typesList.map(t => (
            <FormControlLabel
              key={t.id}
              control={<Checkbox size="small" checked={params.type === t.name} onChange={() => toggleParam('type', t.name)} />}
              label={t.name}
            />
          ))}
        </AccordionDetails>
      </Accordion>

      {/* Ambientes */}
      <Accordion disableGutters>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography variant="body2">Ambientes</Typography></AccordionSummary>
        <AccordionDetails sx={{ p: 1 }}>
          {[1, 2, 3].map(n => (
            <FormControlLabel
              key={n}
              control={<Checkbox size="small" checked={params.rooms === n} onChange={() => toggleParam('rooms', n)} />}
              label={n < 3 ? n : '3+'}
            />
          ))}
        </AccordionDetails>
      </Accordion>

      {/* Precio */}
      <Accordion disableGutters>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography variant="body2">Precio</Typography></AccordionSummary>
        <AccordionDetails sx={{ p: 2 }}>
          <Slider
            value={params.priceRange}
            onChange={(_, v) => setParams(p => ({ ...p, priceRange: v as number[] }))}
            onChangeCommitted={() => autoSearch(params, selected)}
            valueLabelDisplay="auto"
            min={0}
            max={PRICE_MAX}
            step={100000}
          />
        </AccordionDetails>
      </Accordion>

      {/* Superficie Total */}
      <Accordion disableGutters>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography variant="body2">Superficie Total</Typography></AccordionSummary>
        <AccordionDetails sx={{ p: 2 }}>
          <Slider
            value={params.areaRange}
            onChange={(_, v) => setParams(p => ({ ...p, areaRange: v as number[] }))}
            onChangeCommitted={() => autoSearch(params, selected)}
            valueLabelDisplay="auto"
            min={0}
            max={AREA_MAX}
            step={10}
          />
        </AccordionDetails>
      </Accordion>

      {/* Superficie Cubierta */}
      <Accordion disableGutters>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography variant="body2">Superficie Cubierta</Typography></AccordionSummary>
        <AccordionDetails sx={{ p: 2 }}>
          <Slider
            value={params.coveredRange}
            onChange={(_, v) => setParams(p => ({ ...p, coveredRange: v as number[] }))}
            onChangeCommitted={() => autoSearch(params, selected)}
            valueLabelDisplay="auto"
            min={0}
            max={COVERED_MAX}
            step={10}
          />
        </AccordionDetails>
      </Accordion>

      {/* Características */}
      <Accordion disableGutters>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography variant="body2">Características</Typography></AccordionSummary>
        <AccordionDetails sx={{ p: 1 }}>
          {amenitiesList.map(a => (
            <FormControlLabel
              key={a.id}
              control={<Checkbox size="small" checked={selected.amenities.includes(a.id)} onChange={() => { const next = selected.amenities.includes(a.id) ? selected.amenities.filter(x => x !== a.id) : [...selected.amenities, a.id]; const ns = { ...selected, amenities: next }; setSelected(ns); autoSearch(params, ns); }} />}
              label={a.name}
            />
          ))}
        </AccordionDetails>
      </Accordion>

      {/* Ciudades */}
      <Accordion disableGutters>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography variant="body2">Ciudades</Typography></AccordionSummary>
        <AccordionDetails sx={{ p: 1 }}>
          {useMemo(() => Array.from(new Set(neighborhoodsList.map(n => (n.city || '').trim()).filter(Boolean))).sort(), [neighborhoodsList]).map(city => (
            <FormControlLabel
              key={city}
              control={<Checkbox size="small" checked={params.city === city} onChange={() => toggleParam('city', city)} />}
              label={city}
            />
          ))}
        </AccordionDetails>
      </Accordion>

      {/* Barrios */}
      <Accordion disableGutters>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography variant="body2">Barrios</Typography></AccordionSummary>
        <AccordionDetails sx={{ p: 1 }}>
          {neighborhoodsList.map(b => (
            <FormControlLabel
              key={b.id}
              control={<Checkbox size="small" checked={params.neighborhood === b.name} onChange={() => toggleParam('neighborhood', b.name)} />}
              label={b.name}
            />
          ))}
        </AccordionDetails>
      </Accordion>

      {/* Active chips */}
      {chips.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1, mt: 1 }}>
          {chips.map(c => <Chip key={c.label} label={c.label} onDelete={c.clear} size="small" />)}
        </Box>
      )}

      <Divider sx={{ my: 2 }} />
      <LoadingButton fullWidth variant="outlined" loading={loadingReset} startIcon={<RefreshIcon />} onClick={runReset} sx={{ fontSize: '0.875rem', py: 0.5 }}>Reset filtros</LoadingButton>
    </Box>
  );

  return (
    <>
      {isMobile ? (
        <>
          <Button variant="outlined" startIcon={<FilterListIcon />} onClick={() => setDrawerOpen(true)} sx={{ fontSize: '0.875rem', py: 0.5 }}>Filtros</Button>
          <Drawer anchor="bottom" open={drawerOpen} onClose={() => setDrawerOpen(false)} PaperProps={{ sx: { height: '80vh', borderTopLeftRadius: 12, borderTopRightRadius: 12 } }}>{Panel}</Drawer>
        </>
      ) : (
        <Box sx={{ width: 300, flexShrink: 0, borderLeft: '1px solid', borderColor: 'divider' }}>{Panel}</Box>
      )}
    </>
  );
};
