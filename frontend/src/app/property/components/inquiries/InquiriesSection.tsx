// src/app/property/components/inquiries/InquiriesSection.tsx
import { useState } from 'react';
import {
    Box, Typography, Button,
    Menu, MenuItem, CircularProgress, TextField, Autocomplete,
    InputAdornment, useTheme,
    Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useAuthContext } from '../../../user/context/AuthContext';  // ← importamos el contexto de auth

import { Modal } from '../../../shared/components/Modal';
import { InquiriesList } from './InquiriesList';
import { useInquiries } from '../../hooks/useInquiries';
import { InquiryDetail } from './InquiryDetails';

interface Props { propertyIds?: number[] }

export const InquiriesSection = ({ propertyIds }: Props) => {
    const theme = useTheme();
    const { isAdmin } = useAuthContext();   // ← sacamos el flag verdadero
    const {
        inquiries, properties, loading, errorList,
        selected, setSelected, selectedProps,
        filterStatus, setFilterStatus, filterProp, setFilterProp,
        STATUS_OPTIONS,
        markResolved, actionLoadingId, goToProperty,
    } = useInquiries({ propertyIds });

    const [anchorFilter, setAnchorFilter] = useState<HTMLElement | null>(null);

    return (
        <>
            {/* -------- toolbar (solo admin) -------- */}
            {isAdmin && (
                <Box
                    sx={{
                        px: 2, py: 1, gap: 1,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        display: 'flex', alignItems: 'center',
                        flexWrap: { xs: 'nowrap', sm: 'wrap' },
                        overflowX: 'auto',
                    }}
                >
                    {/* filtros mobile */}
                    <Box sx={{ display: { xs: 'flex', sm: 'none' } }}>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={e => setAnchorFilter(e.currentTarget)}
                        >
                            Filtros
                        </Button>
                        <Menu
                            anchorEl={anchorFilter}
                            open={Boolean(anchorFilter)}
                            onClose={() => setAnchorFilter(null)}
                        >
                            <MenuItem
                                selected={filterStatus === ''}
                                onClick={() => { setFilterStatus(''); setAnchorFilter(null); }}
                            >
                                Todos
                            </MenuItem>
                            {STATUS_OPTIONS.map(s => (
                                <MenuItem
                                    key={s}
                                    selected={filterStatus === s}
                                    onClick={() => { setFilterStatus(s); setAnchorFilter(null); }}
                                >
                                    {s}
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }} />

                    {/* buscador siempre a la derecha */}
                    <Box sx={{ flex: '1 1 auto', minWidth: 0, maxWidth: { xs: 'none', sm: '20rem' } }}>
                        <Autocomplete
                            options={properties}
                            getOptionLabel={o => o.title}
                            size="small"
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
                            sx={{ width: '100%', minWidth: 0 }}
                        />
                    </Box>
                </Box>
            )}

            {/* -------- encabezados (sm+) -------- */}
            <Box
                sx={{
                    display: { xs: 'none', sm: 'grid' },
                    gridTemplateColumns: isAdmin
                        ? '3fr 1.5fr 1fr 1.5fr'
                        : '1.5fr 3fr 75px',
                    px: 2,
                    py: 1,
                }}
            >
                <Tooltip title="Título / Fecha">
                    <Typography
                        fontWeight={700}
                        noWrap
                        sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        Título / Fecha
                    </Typography>
                </Tooltip>

                <Tooltip title={isAdmin ? 'Usuario' : 'Descripción'}>
                    <Typography
                        fontWeight={700}
                        noWrap
                        sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {isAdmin ? 'Usuario' : 'Descripción'}
                    </Typography>
                </Tooltip>

                <Tooltip title="Estado">
                    <Typography
                        fontWeight={700}
                        noWrap
                        align={isAdmin ? 'left' : 'right'}
                        sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        Estado
                    </Typography>
                </Tooltip>

                {isAdmin && (
                    <Tooltip title="Acción">
                        <Typography
                            fontWeight={700}
                            align="right"
                            noWrap
                            sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            Acción
                        </Typography>
                    </Tooltip>
                )}
            </Box>

            {/* -------- lista -------- */}
            <Box sx={{ px: 2, flexGrow: 1, overflowY: 'auto' }}>
                {loading ? (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                        <CircularProgress size={24} />
                    </Box>
                ) : errorList ? (
                    <Typography color="error" align="center" py={3}>
                        {errorList}
                    </Typography>
                ) : (
                    <InquiriesList
                        inquiries={inquiries}
                        isAdmin={isAdmin}                  // ← paso el flag real
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
