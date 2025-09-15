import { Box, FormControl, InputLabel, Select, MenuItem, TextField } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { ContractType, ContractStatus, type Contract } from "../../types/contract";
import { useContractFilters } from "../../hooks/contracts/useContractFilters";

interface Props {
  filter: "ALL" | ContractStatus;
  onFilterChange: (f: "ALL" | ContractStatus) => void;
  onSearch: (contracts: Contract[]) => void;
}

export const ContractsFilters = ({ filter, onFilterChange, onSearch }: Props) => {
  const { typeFilter, setTypeFilter, dateFrom, setDateFrom, dateTo, setDateTo } = useContractFilters(filter, onSearch);

  const handleStatusChange = (e: SelectChangeEvent<"ALL" | ContractStatus>) => {
    onFilterChange(e.target.value as "ALL" | ContractStatus);
  };

  const handleTypeChange = (e: SelectChangeEvent<"ALL" | ContractType>) => {
    setTypeFilter(e.target.value as "ALL" | ContractType);
  };

  return (
    <Box display="flex" flexWrap="wrap" justifyContent="center" alignItems="center" gap={2} mb={3}>
      {/* Estado */}
      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel id="status-label">Estado</InputLabel>
        <Select<"ALL" | ContractStatus>
          labelId="status-label"
          value={filter}
          label="Estado"
          onChange={handleStatusChange}
        >
          <MenuItem value="ALL">Todos</MenuItem>
          <MenuItem value={ContractStatus.ACTIVO}>Activos</MenuItem>
          <MenuItem value={ContractStatus.INACTIVO}>Inactivos</MenuItem>
        </Select>
      </FormControl>

      {/* Tipo */}
      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel id="type-label">Tipo</InputLabel>
        <Select<"ALL" | ContractType> labelId="type-label" value={typeFilter} label="Tipo" onChange={handleTypeChange}>
          <MenuItem value="ALL">Todos</MenuItem>
          <MenuItem value={ContractType.VIVIENDA}>Vivienda</MenuItem>
          <MenuItem value={ContractType.COMERCIAL}>Comercial</MenuItem>
          <MenuItem value={ContractType.TEMPORAL}>Temporal</MenuItem>
        </Select>
      </FormControl>

      {/* Desde */}
      <TextField
        size="small"
        label="Desde"
        type="date"
        value={dateFrom}
        onChange={(e) => setDateFrom(e.target.value)}
        InputLabelProps={{ shrink: true }}
        inputProps={{ max: dateTo || undefined }}
        sx={{ minWidth: 160 }}
      />

      {/* Hasta */}
      <TextField
        size="small"
        label="Hasta"
        type="date"
        value={dateTo}
        onChange={(e) => setDateTo(e.target.value)}
        InputLabelProps={{ shrink: true }}
        inputProps={{ min: dateFrom || undefined }}
        sx={{ minWidth: 160 }}
      />
    </Box>
  );
};
