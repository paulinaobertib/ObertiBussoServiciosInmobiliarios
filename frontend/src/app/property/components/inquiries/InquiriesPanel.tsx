import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Stack, Chip, useTheme } from '@mui/material';
import { useAuthContext } from '../../../user/context/AuthContext';
import {
    getInquiriesByUser,
    getAllInquiries,
    getInquiriesByStatus,
    getInquiriesByProperty,
} from '../../services/inquiry.service';
import { getAllProperties } from '../../services/property.service';
import { Inquiry, InquiryStatus } from '../../types/inquiry';
import { Property } from '../../types/property';
import InquiryCard from './InquiryCard';
import InquiryFilterBar from './InquiriesFilter';
import { Modal } from '../../../shared/components/Modal';

const STATUS_OPTIONS: InquiryStatus[] = ['ABIERTA', 'CERRADA'];

export default function InquiriesPanel() {
    const theme = useTheme();
    const { info, isAdmin } = useAuthContext();

    /* ── state ─────────────────────────────────────────────── */
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<Inquiry | null>(null);

    /* filtros */
    const [filterStatus, setFilterStatus] = useState<InquiryStatus | ''>('');
    const [filterProp, setFilterProp] = useState<number | ''>('');

    /* ── helpers de carga ──────────────────────────────────── */
    const loadInquiries = async () => {
        if (!info) return;
        setLoading(true);
        try {
            const res = isAdmin
                ? await getAllInquiries()
                : await getInquiriesByUser(info.id);
            setInquiries(res.data);
            setError(null);
        } catch {
            setError(isAdmin
                ? 'Error al cargar todas las consultas'
                : 'Error al cargar tus consultas');
        } finally {
            setLoading(false);
        }
    };

    const loadFiltered = async () => {
        setLoading(true);
        try {
            let data: Inquiry[] = [];

            if (filterStatus && filterProp) {
                const res = await getInquiriesByProperty(filterProp as number);
                data = res.data.filter((i: { status: string; }) => i.status === filterStatus);

            }
            else if (filterStatus) {
                data = (await getInquiriesByStatus(filterStatus)).data;
            }
            else if (filterProp) {
                data = (await getInquiriesByProperty(filterProp as number)).data;
            }
            else {
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

    /* ── efectos ───────────────────────────────────────────── */
    useEffect(() => {
        getAllProperties()
            .then(res => setProperties(res)) // res: Property[]
            .catch(err => console.error('Error fetching properties', err));
    }, []);

    /* consultas (contexto o filtros) */
    useEffect(() => {
        if (!isAdmin) {
            loadInquiries();
            return;
        }
        // Admin puede ver filtros y aplicarlos
        (filterStatus || filterProp) ? loadFiltered() : loadInquiries();
    }, [info, isAdmin, filterStatus, filterProp]);

    /* ── opciones para la barra de filtros ─────────────────── */
    const propertyOptions = properties.map(p => ({
        id: p.id,
        title: p.title,
    }));

    /* ── UI ─────────────────────────────────────────────────── */
    return (
        <>
            {/* Barra de filtros SOLO para administradores */}
            {isAdmin && (
                <InquiryFilterBar
                    statusOptions={STATUS_OPTIONS}
                    propertyOptions={propertyOptions}
                    selectedStatus={filterStatus}
                    selectedProperty={filterProp}
                    onStatusChange={val => setFilterStatus(val as InquiryStatus | '')}
                    onPropertyChange={val => setFilterProp(val as number | '')}
                />
            )}

            {/* Estado de carga / error / lista */}
            {loading ? (
                <Typography>Cargando consultas…</Typography>
            ) : error ? (
                <Typography color="error">{error}</Typography>
            ) : inquiries.length === 0 ? (
                <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
                    {isAdmin ? 'No hay consultas registradas.' : 'No tienes consultas aún.'}
                </Typography>
            ) : (
                <Box sx={{ p: 2 }}>
                    <Grid container spacing={2}>
                        {inquiries.map(inq => (
                            <Grid size={{ xs: 12, sm: 6 }} key={inq.id}>
                                <InquiryCard
                                    inquiry={inq}
                                    isAdmin={isAdmin}
                                    onStatusUpdated={filterStatus || filterProp ? loadFiltered : loadInquiries}
                                    onSelect={setSelected}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {/* Modal de detalle */}
            <Modal
                open={Boolean(selected)}
                title={selected ? `Consulta #${selected.id}` : ''}
                onClose={() => setSelected(null)}
            >
                {selected && (
                    <Stack spacing={2}>
                        <Typography><strong>Usuario:</strong> {selected.firstName} {selected.lastName}</Typography>
                        <Typography><strong>Contacto:</strong> {selected.email} | {selected.phone}</Typography>
                        <Typography><strong>Título:</strong> {selected.title}</Typography>
                        <Typography><strong>Descripción:</strong> {selected.description}</Typography>
                        <Typography><strong>Estado:</strong> {selected.status}</Typography>

                        <Box>
                            <Typography variant="subtitle2"><strong>Propiedades:</strong></Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                                {(selected.propertyTitles ?? []).map(p => (
                                    <Chip key={p} label={p} sx={{ bgcolor: theme.palette.quaternary.main }} />
                                ))}
                            </Stack>
                        </Box>

                        <Stack direction="row" justifyContent="space-between">
                            <Typography color="text.secondary">
                                Creada: {new Date(selected.date).toLocaleString()}
                            </Typography>
                            {selected.status === 'CERRADA' && selected.dateClose && (
                                <Typography color="text.secondary">
                                    Cerrada: {new Date(selected.dateClose).toLocaleString()}
                                </Typography>
                            )}
                        </Stack>
                    </Stack>
                )}
            </Modal>
        </>
    );
}
