import { Box, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';

interface InquiriesFilterBarProps {
    statusOptions: string[];
    propertyOptions: { id: number; title: string }[];
    selectedStatus: string;
    selectedProperty: number | '';
    onStatusChange: (status: string) => void;
    onPropertyChange: (propId: number | '') => void;
}

export default function InquiriesFilterBar({
    statusOptions,
    propertyOptions,
    selectedStatus,
    selectedProperty,
    onStatusChange,
    onPropertyChange,
}: InquiriesFilterBarProps) {
    return (
        <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="filter-status-label">Estado</InputLabel>
                <Select
                    labelId="filter-status-label"
                    label="Estado"
                    value={selectedStatus}
                    onChange={(e: SelectChangeEvent) => onStatusChange(e.target.value)}
                >
                    <MenuItem value=""><em>Todos</em></MenuItem>
                    {statusOptions.map(status => (
                        <MenuItem key={status} value={status}>{status}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel id="filter-prop-label">Propiedad</InputLabel>
                <Select
                    labelId="filter-prop-label"
                    label="Propiedad"
                    value={selectedProperty}
                    onChange={(e: SelectChangeEvent<number>) => onPropertyChange(e.target.value as number)}
                >
                    <MenuItem value=""><em>Todas</em></MenuItem>
                    {propertyOptions.map(p => (
                        <MenuItem key={p.id} value={p.id}>{p.title}</MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
}
