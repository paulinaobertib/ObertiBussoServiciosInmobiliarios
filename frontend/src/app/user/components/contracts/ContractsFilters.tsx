import { Box, FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';
import { ContractType, ContractStatus } from '../../types/contract';
import { useContractFilters } from '../../hooks/contracts/useContractFilters';

interface Props {
    filter: 'ALL' | ContractStatus;
    onFilterChange: (f: 'ALL' | ContractStatus) => void;
    onSearch: (contracts: any[]) => void;
}

export const ContractsFilters = ({ filter, onFilterChange, onSearch, }: Props) => {
    const {
        typeFilter,
        setTypeFilter,
        dateFrom,
        setDateFrom,
        dateTo,
        setDateTo,
    } = useContractFilters(filter, onSearch);

    return (
        <Box
            display="flex"
            flexWrap="wrap"
            justifyContent="center"
            alignItems="center"
            gap={2}
            mb={3}
        >
            {/* Estado */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="status-label">Estado</InputLabel>
                <Select
                    labelId="status-label"
                    value={filter}
                    label="Estado"
                    onChange={e => onFilterChange(e.target.value as any)}
                >
                    <MenuItem value="ALL">Todos</MenuItem>
                    <MenuItem value={ContractStatus.ACTIVO}>Activos</MenuItem>
                    <MenuItem value={ContractStatus.INACTIVO}>Inactivos</MenuItem>
                </Select>
            </FormControl>

            {/* Tipo */}
            <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel id="type-label">Tipo</InputLabel>
                <Select
                    labelId="type-label"
                    value={typeFilter}
                    label="Tipo"
                    onChange={e => setTypeFilter(e.target.value as any)}
                >
                    <MenuItem value="ALL">Todos</MenuItem>
                    <MenuItem value={ContractType.TEMPORAL}>Temporal</MenuItem>
                    <MenuItem value={ContractType.VIVIENDA}>Vivienda</MenuItem>
                    <MenuItem value={ContractType.COMERCIAL}>Comercial</MenuItem>
                </Select>
            </FormControl>

            {/* Desde */}
            <TextField
                size="small"
                label="Desde"
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 130 }}
            />

            {/* Hasta */}
            <TextField
                size="small"
                label="Hasta"
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 130 }}
            />
        </Box>
    );
};
