import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { MixedList } from './InquiriesList';
import { useInquiries, STATUS_OPTIONS } from '../../hooks/useInquiries';
import { InquiriesFilter } from './InquiriesFilter';
import { InquiryStatus } from '../../types/inquiry';
import theme from '../../../../theme';

interface Props { propertyIds?: number[] }

export const InquiriesSection: React.FC<Props> = ({ propertyIds }) => {
    const {
        inquiries,
        chatSessions, // ← debe salir de tu useInquiries
        properties,
        loading,
        errorList,
        filterStatus,
        setFilterStatus,
        filterProp,
        setFilterProp,
        markResolved,
        actionLoadingId,
        closeChatSession, // ← asegurate de tener esto en el hook
    } = useInquiries({ propertyIds });

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
                />
            </Box>

            {/* -------- lista mixta -------- */}
            <Box sx={{ px: 2, flexGrow: 1, overflowY: 'auto' }}>
                {errorList ? (
                    <Typography color="error" align="center" py={3}>
                        {errorList}
                    </Typography>
                ) : (
                    <MixedList
                        inquiries={inquiries || []}
                        chatSessions={chatSessions || []}
                        loadingId={actionLoadingId}
                        onResolve={markResolved}
                        onCloseChat={closeChatSession}
                    />
                )}
            </Box>
        </>
    );
};
