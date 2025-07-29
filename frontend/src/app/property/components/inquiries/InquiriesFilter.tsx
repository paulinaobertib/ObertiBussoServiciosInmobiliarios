import React from 'react';
import {
    Box,
    ToggleButtonGroup,
    ToggleButton,
    Autocomplete,
    TextField,
    InputAdornment,
    useTheme,
    useMediaQuery,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectChangeEvent,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface Props {
    statusOptions: string[];
    propertyOptions: { id: number; title: string }[];
    selectedStatus: string;
    selectedProperty: number | '';
    onStatusChange: (status: string) => void;
    onPropertyChange: (propId: number | '') => void;
}

export const InquiriesFilter: React.FC<Props> = ({
    statusOptions,
    propertyOptions,
    selectedStatus,
    selectedProperty,
    onStatusChange,
    onPropertyChange,
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            {/* Estado filter: desktop ToggleButtonGroup, mobile Select */}
            {!isMobile ? (
                <ToggleButtonGroup
                    value={selectedStatus}
                    exclusive
                    size="small"
                    onChange={(_, v) => v !== null && onStatusChange(v)}
                >
                    <ToggleButton value="">Todos</ToggleButton>
                    {statusOptions.map((s) => (
                        <ToggleButton key={s} value={s}>
                            {s}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            ) : (
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel id="filter-status-label">Estado</InputLabel>
                    <Select
                        labelId="filter-status-label"
                        label="Estado"
                        value={selectedStatus}
                        onChange={(e: SelectChangeEvent) => onStatusChange(e.target.value)}
                    >
                        <MenuItem value="">Todos</MenuItem>
                        {statusOptions.map((s) => (
                            <MenuItem key={s} value={s}>{s}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            )}

            {/* Property filter: Autocomplete always */}
            <Autocomplete
                options={propertyOptions}
                getOptionLabel={(o) => o.title}
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
