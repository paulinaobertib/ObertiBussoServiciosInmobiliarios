import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
  Collapse,
  TextField,
  Card,
  CardContent,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTheme } from '@mui/material/styles';
import { usePropertyCrud } from '../context/PropertiesContext';
import { getPropertiesByFilters } from '../services/property.service';
import { SearchParams } from '../types/searchParams';
import { Property } from '../types/property';
import { NeighborhoodType } from '../types/neighborhood';

const countOptions = [1, 2, 3];

interface Props {
  onSearch(results: Property[]): void;
}

export default function SearchFilters({ onSearch }: Props) {
  const {
    typesList,
    neighborhoodsList,
    amenitiesList,
    operationsList,
    selected,
    setSelected,
    buildSearchParams
  } = usePropertyCrud();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [openFilters, setOpen] = useState(!isMobile);

  const [params, setParams] = useState<Partial<SearchParams>>({
    priceFrom: 0,
    priceTo: 0,
    areaFrom: 0,
    areaTo: 0,
    rooms: 0,
    operation: '',
    type: '',
    amenities: [],
    city: '',
    neighborhood: '',
    neighborhoodType: undefined,
  });

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParams(p => ({
      ...p,
      [name]: value === '' ? 0 : Number(value)
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
    const sp = buildSearchParams(params);
    const res = await getPropertiesByFilters(sp as SearchParams);
    onSearch(res);
  };

  const handleCancel = async () => {
    setParams({
      priceFrom: 0,
      priceTo: 0,
      areaFrom: 0,
      areaTo: 0,
      rooms: 0,
      operation: '',
      type: '',
      amenities: [],
      city: '',
      neighborhood: '',
      neighborhoodType: '',
    });

    setSelected({ owner: null, neighborhood: null, type: null, amenities: [] });

    const all = await getPropertiesByFilters({
      priceFrom: 0, priceTo: 0, areaFrom: 0, areaTo: 0,
      rooms: 0, operation: '', type: '', amenities: [],
      city: '', neighborhood: '', neighborhoodType: ''
    });
    onSearch(all);
  };


  const cities = Array.from(
    new Set(
      neighborhoodsList
        .map(n => (n.city || '').trim())   // quitamos espacios
        .filter(c => c.length > 0)          // sólo los no vacíos
    )
  );
  const barrioTypes = Object.values(NeighborhoodType);



  const anyOption = (
    <MenuItem key="any" value="">
      Cualquiera
    </MenuItem>
  );

  return (
    <Card sx={{ p: 1, width: isMobile ? '100%' : 300 }} elevation={3}>
      <CardContent>
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
          <Box display="flex" flexDirection="column" gap={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Operación</InputLabel>
              <Select
                value={params.operation || ''}
                label="Operación"
                onChange={handleSelect('operation')}
              >
                {anyOption}
                {operationsList.map((op) => (
                  <MenuItem key={op} value={op}>
                    {op.charAt(0) + op.slice(1).toLowerCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

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
                    {n === 0 ? 'Cualquiera' : n < 3 ? `${n}` : '3+'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Ciudad</InputLabel>
              <Select
                value={params.city || ''}
                label="Ciudad"
                onChange={e => {
                  const city = (e.target.value as string).trim();
                  setParams(p => ({ ...p, city }));
                }}
              >
                <MenuItem value="">
                  <em>Cualquiera</em>
                </MenuItem>
                {cities.map(c => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
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
                value={selected.neighborhood?.toString() || ''}
                label="Barrio"
                onChange={(e) =>
                  setSelected({
                    ...selected,
                    neighborhood: Number(e.target.value),
                  })
                }
              >
                {anyOption}
                {neighborhoodsList.map((nb) => (
                  <MenuItem key={nb.id} value={nb.id.toString()}>
                    {nb.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Servicios</InputLabel>
              <Select
                multiple
                value={selected.amenities.map(a => a.toString())}
                label="Servicios"
                renderValue={vals =>
                  (vals as string[]).length === 0
                    ? 'Cualquiera'
                    : (vals as string[])
                      .map(v => amenitiesList.find(a => a.id === Number(v))?.name)
                      .filter(Boolean)
                      .join(', ')
                }
                onChange={e => {
                  // eliminamos cualquier '' por seguridad
                  const vals = (e.target.value as string[]).filter(v => v !== '');
                  setSelected({ ...selected, amenities: vals.map(v => Number(v)) });
                }}
              >
                {/* Opción “Cualquiera” interceptada */}
                <MenuItem
                  value=""
                  onMouseDown={event => {
                    // evita que MUI añada "" al array
                    event.preventDefault();
                    // limpia la selección
                    setSelected({ ...selected, amenities: [] });
                  }}
                >
                  <em>Cualquiera</em>
                </MenuItem>

                {/* Resto de servicios */}
                {amenitiesList.map(a => (
                  <MenuItem key={a.id} value={a.id.toString()}>
                    {a.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>


            <FormControl fullWidth variant="outlined" size="small">
              {/* El label “flotante” */}
              <InputLabel shrink>Superficie (m²)</InputLabel>

              {/* Tus dos campos, con un pequeño margen-top para no tapar el label */}
              <Box display="flex" gap={1} mt={1}>
                <TextField
                  name="areaFrom"
                  // label="Desde"
                  placeholder="Desde"
                  type="number"
                  value={params.areaFrom || ''}
                  onChange={handleInput}
                  fullWidth
                  size="small"
                />
                <TextField
                  name="areaTo"
                  // label="Hasta"
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
              {/* El label “flotante” */}
              <InputLabel shrink>Precio</InputLabel>

              {/* Tus dos campos, con un pequeño margen-top para no tapar el label */}
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
              <Button
                variant="outlined"
                fullWidth
                size="medium"
                startIcon={<RefreshIcon />}
                onClick={handleCancel}
              >
                Cancelar
              </Button>
              <Button variant="contained" fullWidth size="medium" onClick={handleSearch}>
                Buscar
              </Button>
            </Box>
          </Box>
        </Collapse>
      </CardContent>
    </Card >
  );
}
