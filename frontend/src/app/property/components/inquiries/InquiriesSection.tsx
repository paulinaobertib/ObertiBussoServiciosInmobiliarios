import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { InquiriesList } from './InquiriesList';
import { useInquiries, STATUS_OPTIONS } from '../../hooks/useInquiries';
import { InquiriesFilter } from './InquiriesFilter';
import { InquiryStatus } from '../../types/inquiry';
import theme from '../../../../theme';

interface Props { propertyIds?: number[] }

export const InquiriesSection: React.FC<Props> = ({ propertyIds }) => {
    const {
        inquiries,
        properties,
        loading,
        errorList,
        filterStatus,
        setFilterStatus,
        filterProp,
        setFilterProp,
        markResolved,
        actionLoadingId,
    } = useInquiries({ propertyIds });

    // --- Cambiado: ahora el loading cubre todo ---
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

            {/* -------- lista -------- */}
            <Box sx={{ px: 2, flexGrow: 1, overflowY: 'auto' }}>
                {errorList ? (
                    <Typography color="error" align="center" py={3}>
                        {errorList}
                    </Typography>
                ) : (
                    <InquiriesList
                        inquiries={inquiries}
                        loadingId={actionLoadingId}
                        onResolve={markResolved}
                    />
                )}
            </Box>
        </>
    );
};
