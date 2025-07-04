import { useEffect, useState } from 'react';
import {
    Box, Typography, CircularProgress, useTheme, Button, ToggleButtonGroup,
    ToggleButton, Menu, MenuItem, Autocomplete, TextField, InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { LoadingButton } from '@mui/lab';
import { useAuthContext } from '../../../user/context/AuthContext';
import {
    getInquiriesByUser,
    getAllInquiries,
    getInquiriesByStatus,
    getInquiriesByProperty,
    updateInquiry
} from '../../services/inquiry.service';
import { getAllProperties } from '../../services/property.service';
import { Inquiry, InquiryStatus } from '../../types/inquiry';
import { Modal } from '../../../shared/components/Modal';
import { useNavigate } from 'react-router-dom';
import { buildRoute, ROUTES } from '../../../../lib';

interface Props {
    propertyIds?: number[];
    onDone?: () => void;
}

const STATUS_OPTIONS: InquiryStatus[] = ['ABIERTA', 'CERRADA'];


export const InquiriesPanel = ({ propertyIds, onDone }: Props) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { info, isAdmin } = useAuthContext();

    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [properties, setProperties] = useState<{ id: number; title: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<Inquiry | null>(null);
    const [selectedProps, setSelectedProps] = useState<{ id: number; title: string }[]>([]);
    const [filterStatus, setFilterStatus] = useState<InquiryStatus | ''>('');
    const [filterProp, setFilterProp] = useState<string>('');
    const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
    const [anchorFilter, setAnchorFilter] = useState<HTMLElement | null>(null);


    const GRID_TEMPLATE = isAdmin
        ? '1.5fr 1fr 1fr 1fr'   // incluye “Acción”
        : '1.5fr 3fr 1fr';      // sin “Acción”

    // load properties for search and modal
    useEffect(() => {
        getAllProperties()
            .then(res => setProperties(res.map((p: { id: any; title: any; }) => ({ id: p.id, title: p.title }))))
            .catch(() => setProperties([]));
    }, []);

    const loadAll = async () => {
        if (!info) return;
        setLoading(true);
        try {
            const res = isAdmin
                ? await getAllInquiries()
                : await getInquiriesByUser(info.id);
            setInquiries(res.data);
            setError(null);
        } catch {
            setError(isAdmin ? 'Error al cargar todas las consultas' : 'Error al cargar tus consultas');
        } finally {
            setLoading(false);
        }
    };

    const loadFiltered = async () => {
        setLoading(true);
        try {
            const propId = filterProp ? parseInt(filterProp, 10) : undefined;
            let data: Inquiry[] = [];
            if (filterStatus && propId) {
                data = (await getInquiriesByProperty(propId)).data.filter((i: { status: string; }) => i.status === filterStatus);
            } else if (filterStatus) {
                data = (await getInquiriesByStatus(filterStatus)).data;
            } else if (propId) {
                data = (await getInquiriesByProperty(propId)).data;
            } else {
                data = isAdmin
                    ? (await getAllInquiries()).data
                    : (await getInquiriesByUser(info!.id)).data;
            }
            setInquiries(data);
            setError(null);
        } catch {
            setError('Error al aplicar filtros');
        } finally {
            setLoading(false);
        }
    };

    // initial & filter effect
    useEffect(() => {
        if (propertyIds && propertyIds.length) {
            (async () => {
                setLoading(true);
                try {
                    const all: Inquiry[] = [];
                    for (const pid of propertyIds) {
                        const res = await getInquiriesByProperty(pid);
                        all.push(...res.data);
                    }
                    setInquiries(all);
                    setError(null);
                } catch {
                    setError('Error al cargar consultas de propiedad');
                } finally {
                    setLoading(false);
                }
            })();
        } else if (isAdmin && (filterStatus || filterProp)) {
            loadFiltered();
        } else {
            loadAll();
        }
    }, [info, isAdmin, filterStatus, filterProp, propertyIds]);

    // map selectedProps
    useEffect(() => {
        if (!selected) {
            setSelectedProps([]);
            return;
        }
        const mapped = (selected.propertyTitles ?? [])
            .map(title => properties.find(p => p.title === title))
            .filter((p): p is { id: number; title: string } => Boolean(p));
        setSelectedProps(mapped);
    }, [selected, properties]);

    return (
        <>
            {/* top bar responsive */}
            {isAdmin && (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        px: 2,
                        py: 1,
                        gap: 1,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                    }}
                >
                    {/* Estado (desktop) */}
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                        <ToggleButtonGroup
                            value={filterStatus}
                            exclusive
                            size="small"
                            onChange={(_, v) => setFilterStatus(v as InquiryStatus)}
                            sx={{ flexWrap: 'wrap' }}
                        >
                            <ToggleButton value="">Todos</ToggleButton>
                            {STATUS_OPTIONS.map(s => (
                                <ToggleButton key={s} value={s}>
                                    {s}
                                </ToggleButton>
                            ))}
                        </ToggleButtonGroup>
                    </Box>

                    {/* Estado (móvil) */}
                    <Box sx={{ display: { xs: 'flex', sm: 'none' } }}>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={e => setAnchorFilter(e.currentTarget)}
                            sx={{
                                // minWidth: 100,
                                alignSelf: 'center',
                            }}
                        >
                            {'Filtros'}
                        </Button>
                        <Menu
                            anchorEl={anchorFilter}
                            open={Boolean(anchorFilter)}
                            onClose={() => setAnchorFilter(null)}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                        >
                            <MenuItem
                                selected={filterStatus === ''}
                                onClick={() => {
                                    setFilterStatus('');
                                    setAnchorFilter(null);
                                }}
                            >
                                Todos
                            </MenuItem>
                            {STATUS_OPTIONS.map(s => (
                                <MenuItem
                                    key={s}
                                    selected={filterStatus === s}
                                    onClick={() => {
                                        setFilterStatus(s);
                                        setAnchorFilter(null);
                                    }}
                                >
                                    {s}
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>

                    {/* spacer en desktop */}
                    <Box sx={{ flexGrow: 1 }} />

                    {/* Buscador de propiedades */}
                    <Autocomplete
                        options={properties}
                        getOptionLabel={opt => opt.title}
                        value={properties.find(p => p.id.toString() === filterProp) || null}
                        onChange={(_, val) => setFilterProp(val?.id.toString() || '')}
                        clearOnEscape
                        size="small"
                        sx={{
                            width: { xs: '25rem', sm: '20rem' },
                        }}
                        renderInput={params => (
                            <TextField
                                {...params}
                                placeholder="Buscar propiedad…"
                                variant="outlined"
                                size="small"

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

            {loading ? (
                <Box sx={{ textAlign: 'center', p: 2 }}><CircularProgress size={24} /></Box>
            ) : error ? (
                <Box sx={{ textAlign: 'center', p: 2 }}><Typography color="error">{error}</Typography></Box>
            ) : inquiries.length === 0 ? (
                <Box sx={{ textAlign: 'center', p: 2 }}><Typography color="text.secondary">{isAdmin ? 'No hay consultas registradas.' : 'Aún no tienes consultas.'}</Typography></Box>
            ) : (
                <Box>
                    <Box
                        sx={{
                            display: { xs: 'none', sm: 'grid' },
                            gridTemplateColumns: GRID_TEMPLATE,
                            px: 2,
                            py: 1,
                        }}
                    >
                        <Typography fontWeight={700}>Título / Fecha</Typography>

                        {isAdmin ? (
                            <Typography fontWeight={700}>Usuario</Typography>
                        ) : (
                            <Typography fontWeight={700}>Descripción</Typography>
                        )}

                        <Typography fontWeight={700} align="right">Estado</Typography>

                        {isAdmin && (
                            <Typography fontWeight={700} align="right">
                                Acción
                            </Typography>
                        )}
                    </Box>

                    {inquiries.map(inq => (
                        <Box
                            key={inq.id}
                            onClick={() => setSelected(inq)}
                            sx={{
                                display: { xs: 'block', sm: 'grid' },
                                gridTemplateColumns: GRID_TEMPLATE,
                                alignItems: 'center',
                                px: 2,
                                py: 1,
                                borderBottom: `1px solid ${theme.palette.divider}`,
                                cursor: 'pointer',
                                '&:hover': { backgroundColor: theme.palette.action.hover },
                            }}
                        >
                            {/* Col-1: Título + fecha */}
                            <Box sx={{ justifySelf: 'start' }}>
                                <Typography noWrap>{inq.title}</Typography>
                                <Typography variant="caption" noWrap color="text.secondary">
                                    {new Date(inq.date).toLocaleDateString()}
                                </Typography>
                            </Box>

                            {/* Col-2: Usuario (admin)  |  Descripción (usuario) */}
                            {isAdmin ? (
                                <Typography noWrap sx={{ justifySelf: 'start' }}>
                                    {inq.firstName} {inq.lastName}
                                </Typography>
                            ) : (
                                <Typography
                                    sx={{
                                        justifySelf: 'start',
                                        whiteSpace: 'normal',      // ⬅ permite wraps
                                        wordBreak: 'break-word',   // ⬅ corta palabras largas
                                    }}
                                >
                                    {inq.description}
                                </Typography>

                            )}

                            {/* Col-3: Estado */}
                            <Button
                                variant="contained"
                                size="small"
                                sx={{
                                    minWidth: 96,
                                    bgcolor:
                                        inq.status === 'ABIERTA'
                                            ? theme.palette.tertiary.main
                                            : theme.palette.quaternary.main,
                                    color: theme.palette.getContrastText(
                                        inq.status === 'ABIERTA'
                                            ? theme.palette.tertiary.main
                                            : theme.palette.quaternary.main
                                    ),
                                    pointerEvents: 'none',
                                    justifySelf: 'end',
                                }}
                            >
                                {inq.status}
                            </Button>

                            {/* Col-4: Acción (solo admin) */}
                            {isAdmin && (
                                <Box
                                    onClick={e => e.stopPropagation()}
                                    sx={{ justifySelf: 'end' }}
                                >
                                    {inq.status === 'ABIERTA' ? (
                                        <LoadingButton
                                            variant="contained"
                                            size="small"
                                            loading={actionLoadingId === inq.id}
                                            onClick={async () => {
                                                setActionLoadingId(inq.id);
                                                await updateInquiry(inq.id);
                                                setActionLoadingId(null);
                                                loadFiltered();
                                            }}
                                            sx={{
                                                minWidth: 120,
                                                bgcolor: theme.palette.primary.main,
                                                color: theme.palette.getContrastText(theme.palette.primary.main),
                                            }}
                                        >
                                            Marcar resuelta
                                        </LoadingButton>
                                    ) : (
                                        <Typography
                                            variant="body2"
                                            sx={{ minWidth: 120, textAlign: 'center', color: 'text.secondary' }}
                                        >
                                            —
                                        </Typography>
                                    )}
                                </Box>
                            )}
                        </Box>
                    ))}

                    <Modal open={Boolean(selected)} title={selected ? `Consulta #${selected.id}` : ''} onClose={() => { setSelected(null); onDone?.(); setSelectedProps([]); }}>
                        {selected && (
                            <Box sx={{ p: 2, display: 'grid', gap: 1 }}>
                                <Typography><strong>Usuario:</strong> {selected.firstName} {selected.lastName}</Typography>
                                <Typography><strong>Contacto:</strong> {selected.email} | {selected.phone}</Typography>
                                <Typography><strong>Título:</strong> {selected.title}</Typography>
                                <Typography><strong>Descripción:</strong> {selected.description}</Typography>
                                <Typography><strong>Estado:</strong> {selected.status}</Typography>
                                {selectedProps.length > 0 && (
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                            Propiedades:
                                        </Typography>
                                        <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
                                            {selectedProps.map(p => (
                                                <Box
                                                    component="li"
                                                    key={p.id}
                                                    sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}
                                                >
                                                    <Typography component="span" sx={{ mr: 1 }}>–</Typography>
                                                    <Button
                                                        variant="text"
                                                        size="small"
                                                        onClick={() => navigate(buildRoute(ROUTES.PROPERTY_DETAILS, p.id))}
                                                        sx={{
                                                            textTransform: 'none',
                                                            p: 0,
                                                            minWidth: 0,
                                                        }}
                                                    >
                                                        {p.title}
                                                    </Button>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>
                                )}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                    <Typography color="text.secondary">Creada: {new Date(selected.date).toLocaleString()}</Typography>
                                    {selected.status === 'CERRADA' && selected.dateClose && <Typography color="text.secondary">Cerrada: {new Date(selected.dateClose).toLocaleString()}</Typography>}
                                </Box>
                            </Box>
                        )}
                    </Modal>
                </Box>
            )}
        </>
    );
};
