import { useState } from 'react';
import {
    Box, Typography, Button, ToggleButton, ToggleButtonGroup,
    Menu, MenuItem, CircularProgress, TextField, Autocomplete,
    InputAdornment, useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

import { Modal } from '../../../shared/components/Modal';
import { InquiriesList } from './InquiriesList';
import { useInquiries } from '../../hooks/useInquiries';
import { InquiryDetail } from './InquiryDetails';

interface Props { propertyIds?: number[] }

export const InquiriesSection = ({ propertyIds }: Props) => {
    const theme = useTheme();
    const {
        inquiries, properties, loading, errorList,
        selected, setSelected, selectedProps,
        filterStatus, setFilterStatus, filterProp, setFilterProp,
        STATUS_OPTIONS,
        markResolved, actionLoadingId, goToProperty,
    } = useInquiries({ propertyIds });

    /* filtros móviles */
    const [anchorFilter, setAnchorFilter] = useState<HTMLElement | null>(null);

    return (
        <>
            {/* -------- toolbar (admin) -------- */}
            {actionLoadingId !== undefined && (
                <Box sx={{
                    px: 2, py: 1, gap: 1, borderBottom: `1px solid ${theme.palette.divider}`,
                    display: 'flex', alignItems: 'center', flexWrap: 'wrap',
                }}>
                    {/* filtros estado (desktop) */}
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                        <ToggleButtonGroup
                            value={filterStatus}
                            exclusive
                            size="small"
                            onChange={(_, v) => setFilterStatus(v as any)}
                        >
                            <ToggleButton value="">Todos</ToggleButton>
                            {STATUS_OPTIONS.map(s => <ToggleButton key={s} value={s}>{s}</ToggleButton>)}
                        </ToggleButtonGroup>
                    </Box>

                    {/* filtros estado (mobile) */}
                    <Box sx={{ display: { xs: 'flex', sm: 'none' } }}>
                        <Button variant="outlined" size="small" onClick={e => setAnchorFilter(e.currentTarget)}>
                            Filtros
                        </Button>
                        <Menu
                            anchorEl={anchorFilter}
                            open={Boolean(anchorFilter)}
                            onClose={() => setAnchorFilter(null)}
                        >
                            <MenuItem selected={filterStatus === ''} onClick={() => { setFilterStatus(''); setAnchorFilter(null); }}>
                                Todos
                            </MenuItem>
                            {STATUS_OPTIONS.map(s => (
                                <MenuItem key={s} selected={filterStatus === s}
                                    onClick={() => { setFilterStatus(s); setAnchorFilter(null); }}>
                                    {s}
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>

                    <Box sx={{ flexGrow: 1 }} />

                    {/* buscador propiedad */}
                    <Autocomplete
                        options={properties}
                        getOptionLabel={o => o.title}
                        size="small"
                        sx={{ width: { xs: '25rem', sm: '20rem' } }}
                        value={properties.find(p => p.id.toString() === filterProp) || null}
                        onChange={(_, v) => setFilterProp(v?.id.toString() || '')}
                        renderInput={params => (
                            <TextField
                                {...params}
                                placeholder="Buscar propiedad…"
                                InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (
                                        <InputAdornment position="start" sx={{ ml: 1 }}>
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        )}
                    />
                </Box>
            )}

            {/* -------- encabezados (sm+) -------- */}
            {actionLoadingId !== undefined && (
                <Box sx={{
                    display: { xs: 'none', sm: 'grid' },
                    gridTemplateColumns: actionLoadingId !== undefined
                        ? '1.5fr 1fr 1fr 1fr' : '1.5fr 3fr 1fr',
                    px: 2, py: 1,
                }}>
                    <Typography fontWeight={700}>Título / Fecha</Typography>
                    <Typography fontWeight={700}>{actionLoadingId !== undefined ? 'Usuario' : 'Descripción'}</Typography>
                    <Typography fontWeight={700} align="right">Estado</Typography>
                    {actionLoadingId !== undefined && <Typography fontWeight={700} align="right">Acción</Typography>}
                </Box>
            )}

            {/* -------- lista -------- */}
            <Box sx={{ px: 2, flexGrow: 1, overflowY: 'auto' }}>
                {loading ? (
                    <Box sx={{ textAlign: 'center', py: 3 }}><CircularProgress size={24} /></Box>
                ) : errorList ? (
                    <Typography color="error" align="center" py={3}>{errorList}</Typography>
                ) : (
                    <InquiriesList
                        inquiries={inquiries}
                        isAdmin={actionLoadingId !== undefined}
                        loadingId={actionLoadingId}
                        onOpen={setSelected}
                        onResolve={markResolved}
                    />
                )}
            </Box>

            {/* -------- modal detalle -------- */}
            <Modal
                open={Boolean(selected)}
                title={selected ? `Consulta #${selected.id}` : ''}
                onClose={() => setSelected(null)}
            >
                {selected && (
                    <InquiryDetail
                        inquiry={selected}
                        relatedProps={selectedProps}
                        onClose={() => setSelected(null)}
                        onNavigate={goToProperty}
                    />
                )}
            </Modal>
        </>
    );
};
