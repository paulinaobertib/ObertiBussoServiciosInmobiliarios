import React, { useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { MixedList } from './InquiriesList';
import { useInquiries, STATUS_OPTIONS } from '../../hooks/useInquiries';
import { InquiriesFilter } from './InquiriesFilter';
import { InquiryStatus } from '../../types/inquiry';
import theme from '../../../../theme';

interface Props { propertyIds?: number[] }
type ItemType = '' | 'CONSULTAS' | 'CHAT';

export const InquiriesSection: React.FC<Props> = ({ propertyIds }) => {
    const {
        inquiries,
        chatSessions,
        properties,
        loading,
        filterStatus,
        setFilterStatus,
        filterProp,
        setFilterProp,
        markResolved,
        actionLoadingId,
        closeChatSession,
    } = useInquiries({ propertyIds });

    const [filterType, setFilterType] = useState<ItemType>('');

    if (loading) {
        return (
            <Box
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: 3,
                }}
            >
                <CircularProgress size={36} />
            </Box>
        );
    }
    // Aplicar filtro de tipo antes de renderizar la lista
    const inquiriesForList = filterType === 'CHAT' ? [] : (inquiries || []);
    const chatsForList = filterType === 'CONSULTAS' ? [] : (chatSessions || []);

    return (
        <>
            {/* -------- filtros -------- */}
            <Box sx={{
                px: 2, py: 1, borderBottom: `1px solid ${theme.palette.divider}`, flexShrink: 0,
            }}>
                <InquiriesFilter
                    statusOptions={STATUS_OPTIONS}
                    propertyOptions={properties}
                    selectedStatus={filterStatus}
                    selectedProperty={filterProp ? Number(filterProp) : ''}
                    onStatusChange={(status: string) => setFilterStatus(status as InquiryStatus)}
                    onPropertyChange={(val) => setFilterProp(val ? val.toString() : '')}
                    // NUEVO:
                    selectedType={filterType}
                    onTypeChange={setFilterType}
                />
            </Box>

            {/* -------- lista mixta -------- */}
            <Box sx={{ px: 2, flexGrow: 1, overflowY: 'auto' }}>
                <MixedList
                    inquiries={inquiriesForList || []}
                    chatSessions={chatsForList || []}
                    loadingId={actionLoadingId}
                    onResolve={markResolved}
                    onCloseChat={closeChatSession}
                    filterStatus={filterStatus}
                    filterProp={filterProp ? Number(filterProp) : ''} // mismo criterio que usás para el Autocomplete
                    properties={properties}
                />
            </Box>
        </>
    );
};
