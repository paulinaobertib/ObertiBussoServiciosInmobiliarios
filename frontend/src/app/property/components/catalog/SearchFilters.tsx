import React, { useState } from 'react';
import {
  Box, Button, FormControl, InputLabel, Select, MenuItem, useMediaQuery, Collapse,
  TextField, Card, CardContent, Checkbox, FormControlLabel, Typography,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTheme } from '@mui/material/styles';
import { usePropertyCrud } from '../../context/PropertiesContext';
import { getPropertiesByFilters } from '../../services/property.service';
import { SearchParams } from '../../types/searchParams';
import { Property } from '../../types/property';
import { NeighborhoodType } from '../../types/neighborhood';
import { useGlobalAlert } from '../../../shared/context/AlertContext';
import { useLoading } from '../../utils/useLoading';
import { LoadingButton } from '@mui/lab';

const countOptions = [1, 2, 3];

interface Props {
  onSearch(results: Property[]): void;
}

export const SearchFilters = ({ onSearch }: Props) => {
  const { typesList, neighborhoodsList, amenitiesList, operationsList,
    selected, setSelected, buildSearchParams } = usePropertyCrud();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [openFilters, setOpen] = useState(!isMobile);
  const { showAlert } = useGlobalAlert();

  const [params, setParams] = useState<Partial<SearchParams>>({
    priceFrom: 0,
    priceTo: 0,
    areaFrom: 0,
    areaTo: 0,
    coveredAreaFrom: 0,
    coveredAreaTo: 0,
    rooms: 0,
    operation: '',
    type: '',
    amenities: [],
    city: '',
    neighborhood: '',
    neighborhoodType: undefined,
    credit: undefined,
    financing: undefined,
  });

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    const numValue = value === '' ? 0 : Number(value);
    if (numValue < 0) {
      showAlert('El valor no puede ser negativo', 'error');
      return;
    }

    setParams((p) => ({
      ...p,
      [name]: numValue,
    }));
  };

  const handleSelect = (field: keyof SearchParams) => (
    e: SelectChangeEvent<string>
  ) => {
    const v = e.target.value;
    setParams(p => ({
      ...p,
      [field]:
        field === 'rooms'
          ? Number(v)
          : (v as any)
    }));
  };

  const handleSearch = async () => {
    const priceFrom = params.priceFrom ?? 0;
    const priceTo = params.priceTo ?? 0;
    const areaFrom = params.areaFrom ?? 0;
    const areaTo = params.areaTo ?? 0;
    const coveredAreaFrom = params.coveredAreaFrom ?? 0;
    const coveredAreaTo = params.coveredAreaTo ?? 0;

    if (priceFrom && priceTo && priceFrom > priceTo) {
      showAlert('El precio DESDE no puede ser mayor al precio HASTA', 'error');
      return;
    }

    if (areaFrom && areaTo && areaFrom > areaTo) {
      showAlert('La superficie DESDE no puede ser mayor a la superficie HASTA', 'error');
      return;
    }

    if (coveredAreaFrom && coveredAreaTo && coveredAreaFrom > coveredAreaTo) {
      showAlert('La superficie DESDE no puede ser mayor a la superficie HASTA', 'error');
      return;
    }

    const filters: Partial<SearchParams> = {
      ...params,
      priceFrom,
      priceTo,
      areaFrom,
      areaTo,
      coveredAreaFrom,
      coveredAreaTo,
      credit: params.credit ? true : undefined,
      financing: params.financing ? true : undefined,
    };

    // Si rooms es 3, borramos rooms del filtro para no limitar backend a solo 3 ambientes
    if (params.rooms === 3) {
      delete filters.rooms;
    } else if (params.rooms && params.rooms > 0) {
      filters.rooms = params.rooms;
    }

    const sp = buildSearchParams(filters);
    console.log("Filtros a enviar:", sp);

    const res = await getPropertiesByFilters(sp as SearchParams);

    // Ahora filtro local para +3 ambientes
    let filteredResults = res;
    if (params.rooms === 3) {
      filteredResults = res.filter(p => Number(p.rooms) >= 3);
    }

    onSearch(filteredResults);

  };

  const handleCancel = async () => {
    setParams({
      priceFrom: 0,
      priceTo: 0,
      areaFrom: 0,
      areaTo: 0,
      coveredAreaFrom: 0,
      coveredAreaTo: 0,
      rooms: 0,
      operation: '',
      type: '',
      amenities: [],
      city: '',
      neighborhood: '',
      neighborhoodType: undefined,
      credit: undefined,
      financing: undefined,
    });

    setSelected({ owner: null, neighborhood: null, type: null, amenities: [] });

    const all = await getPropertiesByFilters({
      priceFrom: 0, priceTo: 0, areaFrom: 0, areaTo: 0, coveredAreaFrom: 0, coveredAreaTo: 0,
      rooms: 0, operation: '', type: '', amenities: [],
      city: '', neighborhood: '', neighborhoodType: '', credit: undefined, financing: undefined,
    });
    onSearch(all);
  };

  const cities = Array.from(
    new Set(
      neighborhoodsList
        .map(n => (n.city || '').trim())
        .filter(c => c.length > 0)
    )
  );
  const barrioTypes = Object.values(NeighborhoodType);


  const anyOption = (
    <MenuItem key="any" value="">
      Todos
    </MenuItem>
  );

  const { loading: loadingSearch, run: runSearch } = useLoading(handleSearch);
  const { loading: loadingCancel, run: runCancel } = useLoading(handleCancel);
  const loading = loadingSearch || loadingCancel;
  return (
    <Card sx={{ position: 'relative', borderRadius: 3, width: isMobile ? '100%' : 300 }} elevation={3}>
      {loading && (
        <Box
          position="absolute"
          top={0}
          left={0}
          width="100%"
          height="100%"
          zIndex={theme => theme.zIndex.modal + 1000}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
        </Box>
      )}
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.primary.main, mb: 2, textAlign: 'center' }}>
          Filtros de Búsqueda
        </Typography>

        {isMobile && (
          <Button
            fullWidth
            variant="outlined"
            size="small"
            onClick={() => setOpen((f) => !f)}
            endIcon={<ArrowDropDownIcon sx={{ transform: openFilters ? 'rotate(180deg)' : 'none' }} />}
          >
            {openFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
          </Button>
        )}

        <Collapse in={openFilters} timeout="auto" unmountOnExit sx={{ p: 1 }}>

          <FormControl fullWidth size="small">
            <InputLabel id="operation-select-label">Operación</InputLabel>
            <Select
              labelId="operation-select-label"
              id="operation-select"
              data-testid="operation-select"
              value={params.operation || ''}
              label="Operación"
              onChange={handleSelect('operation')}
            >
              {anyOption}
              {operationsList.map((op: string) => (
                <MenuItem key={op} value={op}>
                  {op.charAt(0) + op.slice(1).toLowerCase()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box display="flex" flexDirection="column" gap={2} sx={{ mt: 2 }}>
            {params.operation === 'VENTA' && (
              <>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={params.credit || false}
                      onChange={(_, checked) =>
                        setParams(p => ({ ...p, credit: checked }))
                      }
                      size="small"
                    />
                  }
                  label="Apto Crédito"
                  sx={{
                    width: 'auto',
                    m: 0,
                    py: 0,
                    px: 1,
                    border: '1px solid #ccc',
                    borderRadius: 1,
                    '&:hover': { borderColor: '#444' },
                    '& .MuiFormControlLabel-label': {
                      color: 'text.secondary',
                    },
                  }}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={params.financing || false}
                      onChange={(_, checked) =>
                        setParams(p => ({ ...p, financing: checked }))
                      }
                      size="small"
                    />
                  }
                  label="Apto Financiamiento"
                  sx={{
                    width: 'auto',
                    m: 0,
                    py: 0,
                    px: 1,
                    border: '1px solid #ccc',
                    borderRadius: 1,
                    '&:hover': { borderColor: '#444' },
                    '& .MuiFormControlLabel-label': {
                      color: 'text.secondary',
                    },
                  }}
                />
              </>
            )}

            <FormControl fullWidth size="small">
              <InputLabel>Tipo</InputLabel>
              <Select
                value={params.type || ''}
                label="Tipo"
                onChange={handleSelect('type')}
              >
                {anyOption}
                {typesList.map((t) => (
                  <MenuItem key={t.id} value={t.name}>
                    {t.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Ambientes</InputLabel>
              <Select
                value={params.rooms === 0 ? "" : params.rooms?.toString()}
                label="Ambientes"
                onChange={handleSelect('rooms')}
              >
                {anyOption}
                {countOptions.map((n) => (
                  <MenuItem key={n} value={n.toString()}>
                    {n === 0 ? 'Todos' : n < 3 ? `${n}` : '+3'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel id="city-select-label">Ciudad</InputLabel>
              <Select
                labelId="city-select-label"
                id="city-select"
                value={params.city || ''}
                label="Ciudad"
                onChange={e => {
                  const city = (e.target.value as string).trim();
                  setParams(p => ({ ...p, city }));
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                {cities.map(c => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Tipo de barrio</InputLabel>
              <Select
                value={params.neighborhoodType || ''}
                label="Tipo de barrio"
                onChange={handleSelect('neighborhoodType')}
              >
                {anyOption}
                {barrioTypes.map((bt) => (
                  <MenuItem key={bt} value={bt}>
                    {bt.charAt(0) + bt.slice(1).toLowerCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Barrio</InputLabel>
              <Select
                value={params.neighborhood || ''}
                label="Barrio"
                onChange={handleSelect('neighborhood')}
              >
                {anyOption}
                {neighborhoodsList.map((b) => (
                  <MenuItem key={b.id} value={b.name}>
                    {b.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel id="amenities-select-label">Características</InputLabel>
              <Select
                labelId="amenities-select-label"
                id="amenities-select"
                multiple
                value={selected.amenities.map(a => a.toString())}
                label="Características"
                renderValue={(vals) =>
                  (vals as string[]).length === 0
                    ? 'Todos'
                    : (vals as string[])
                      .map(v => amenitiesList.find(a => a.id === Number(v))?.name)
                      .filter(Boolean)
                      .join(', ')
                }
                onChange={e => {
                  const vals = (e.target.value as string[]).filter(v => v !== '');
                  setSelected({ ...selected, amenities: vals.map(v => Number(v)) });
                }}
              >
                <MenuItem
                  value=""
                  onMouseDown={(event) => {
                    event.preventDefault();
                    setSelected({ ...selected, amenities: [] });
                  }}
                >
                  Todos
                </MenuItem>
                {amenitiesList.map((a) => (
                  <MenuItem key={a.id} value={a.id.toString()}>
                    {a.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel shrink>Superficie Total (m²)</InputLabel>
              <Box display="flex" gap={1} mt={1}>
                <TextField
                  name="areaFrom"
                  placeholder="Desde"
                  type="number"
                  value={params.areaFrom || ''}
                  onChange={handleInput}
                  fullWidth
                  size="small"
                />
                <TextField
                  name="areaTo"
                  placeholder="Hasta"
                  type="number"
                  value={params.areaTo || ''}
                  onChange={handleInput}
                  fullWidth
                  size="small"
                />
              </Box>
            </FormControl>

            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel shrink>Superficie Cubierta</InputLabel>
              <Box display="flex" gap={1} mt={1}>
                <TextField
                  name="coveredAreaFrom"
                  placeholder="Desde"
                  type="number"
                  value={params.coveredAreaFrom || ''}
                  onChange={handleInput}
                  fullWidth
                  size="small"
                />
                <TextField
                  name="coveredAreaTo"
                  placeholder="Hasta"
                  type="number"
                  value={params.coveredAreaTo || ''}
                  onChange={handleInput}
                  fullWidth
                  size="small"
                />
              </Box>
            </FormControl>

            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel shrink>Precio</InputLabel>
              <Box display="flex" gap={1} mt={1}>
                <TextField
                  name="priceFrom"
                  placeholder="Desde"
                  type="number"
                  size="small"
                  value={params.priceFrom || ''}
                  onChange={handleInput}
                  fullWidth
                />
                <TextField
                  name="priceTo"
                  placeholder="Hasta"
                  type="number"
                  size="small"
                  value={params.priceTo || ''}
                  onChange={handleInput}
                  fullWidth
                />
              </Box>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <LoadingButton
                variant="outlined"
                fullWidth
                size="medium"
                startIcon={<RefreshIcon />}
                onClick={() => runCancel()}
                loading={loadingCancel}
                sx={{
                  borderColor: theme.palette.primary.main,
                }}
              >
                Cancelar
              </LoadingButton>
              <LoadingButton
                variant="contained"
                fullWidth
                size="medium"
                onClick={() => runSearch()}
                loading={loadingSearch}
                sx={{
                  bgcolor: theme.palette.primary.main,
                }}
              >
                Buscar
              </LoadingButton>
            </Box>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}