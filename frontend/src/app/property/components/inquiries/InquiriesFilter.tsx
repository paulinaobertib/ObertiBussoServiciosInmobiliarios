import {
  Box, ToggleButtonGroup, ToggleButton, Autocomplete, TextField, InputAdornment,
  useTheme, useMediaQuery, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

type ItemType = '' | 'CONSULTAS' | 'CHAT';

interface Props {
  statusOptions: string[];
  propertyOptions: { id: number; title: string }[];
  selectedStatus: string;
  selectedProperty: number | '';
  onStatusChange: (status: string) => void;
  onPropertyChange: (propId: number | '') => void;
  selectedType: ItemType;
  onTypeChange: (type: ItemType) => void;
}

export const InquiriesFilter = ({
  statusOptions, propertyOptions, selectedStatus, selectedProperty,
  onStatusChange, onPropertyChange,
  selectedType, onTypeChange,
}: Props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
      {/* Estado + Tipo */}
      {!isMobile ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          {/* Estado (valores en MAYÚS, label simple) */}
          <ToggleButtonGroup
            value={selectedStatus}
            exclusive
            size="small"
            onChange={(_, v) => v !== null && onStatusChange(v)}
            aria-label="Filtro por estado"
          >
            <ToggleButton value="">{'Todos'}</ToggleButton>
            {statusOptions.map((s) => (
              <ToggleButton key={s} value={s}>
                {s === 'ABIERTA' ? 'Abierta' : s === 'CERRADA' ? 'Cerrada' : s}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          {/* Tipo (tal cual tu snippet) */}
          <ToggleButtonGroup
            value={selectedType}
            exclusive
            size="small"
            onChange={(_, v) => v !== null && onTypeChange(v)}
            aria-label="Filtro por tipo"
          >
            <ToggleButton value="">{'Todo'}</ToggleButton>
            <ToggleButton value="CONSULTAS">Consultas</ToggleButton>
            <ToggleButton value="CHAT">Chat</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
          {/* Estado (Select móvil) */}
          <FormControl size="small" sx={{ minWidth: 120, flex: 1 }}>
            <InputLabel id="filter-status-label">Estado</InputLabel>
            <Select
              labelId="filter-status-label"
              label="Estado"
              value={selectedStatus}
              onChange={(e: SelectChangeEvent) => onStatusChange(e.target.value)}
            >
              <MenuItem value="">{'Todas'}</MenuItem>
              {statusOptions.map((s) => (
                <MenuItem key={s} value={s}>
                  {s === 'ABIERTA' ? 'Abiertas' : s === 'CERRADA' ? 'Cerradas' : s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Tipo (Select móvil, simple) */}
          <FormControl size="small" sx={{ minWidth: 140, flex: 1 }}>
            <InputLabel id="filter-type-label">Tipo</InputLabel>
            <Select
              labelId="filter-type-label"
              label="Tipo"
              value={selectedType}
              onChange={(e: SelectChangeEvent<ItemType>) => onTypeChange(e.target.value as ItemType)}
            >
              <MenuItem value="">{'Todo'}</MenuItem>
              <MenuItem value="CONSULTAS">Consultas</MenuItem>
              <MenuItem value="CHAT">Chat</MenuItem>
            </Select>
          </FormControl>
        </Box>
      )}

      {/* Property filter */}
      <Autocomplete
        options={propertyOptions}
        getOptionLabel={(o) => o.title}
        isOptionEqualToValue={(o, v) => o.id === v.id}
        size="small"
        value={propertyOptions.find((p) => p.id === selectedProperty) || null}
        onChange={(_, v) => onPropertyChange(v?.id ?? '')}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Buscar propiedad…"
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        )}
        sx={{ flex: 1, minWidth: 0, maxWidth: { xs: 'none', sm: '20rem' } }}
      />
    </Box>
  );
};