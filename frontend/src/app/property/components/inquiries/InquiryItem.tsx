import {
  Box,
  Card,
  Typography,
  Chip,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import type { Inquiry } from '../../types/inquiry';
import { useAuthContext } from '../../../user/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { buildRoute, ROUTES } from '../../../../lib';

interface Props {
  inquiry: Inquiry;
  loading: boolean;
  onResolve: (id: number) => void;
}

const statusMap: Record<string, { label: string }> = {
  ABIERTA: { label: 'Abierta' },
  CERRADA: { label: 'Cerrada' },
};

export const InquiryItem = ({ inquiry, loading, onResolve }: Props) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { isAdmin } = useAuthContext();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const created = dayjs(inquiry.date).locale('es');
  const closed = inquiry.dateClose ? dayjs(inquiry.dateClose).locale('es') : null;
  const status = statusMap[inquiry.status] || { label: inquiry.status };
  const isClosed = inquiry.status === 'CERRADA';

  // Contact information
  const ContactInfo = (
    <Box display="flex" flexWrap="wrap" gap={2} mt={1} >
      <Typography variant="body2">
        <strong>Usuario:</strong> {inquiry.firstName} {inquiry.lastName}
      </Typography>
      <Typography variant="body2">
        <strong>Email:</strong> {inquiry.email}
      </Typography>
      {inquiry.phone && (
        <Typography variant="body2">
          <strong>Teléfono:</strong> {inquiry.phone}
        </Typography>
      )}
    </Box>
  );

  // Property & Title Section
  const PropertyInfo = (
    <Box display="flex" alignItems="center" flexWrap="wrap" gap={2} mb={1}>
      {/* Título de la consulta */}
      <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
        <strong>Título:</strong> {inquiry.title}
      </Typography>

      {/* Divider vertical */}
      <Divider orientation="vertical" flexItem sx={{ bgcolor: theme.palette.grey[300] }} />

      {/* Propiedades consultadas o nota general */}
      {inquiry.propertyTitles.length === 0 ? (
        <Typography variant="body2">
          <strong>Consulta general</strong>
        </Typography>
      ) : (
        <Box display="flex" alignItems="center" flexWrap="wrap" gap={1}>
          <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
            <strong>Propiedad{inquiry.propertyTitles.length > 1 ? 'es' : ''} consultada{inquiry.propertyTitles.length > 1 ? 's' : ''}:</strong>
          </Typography>
          {inquiry.propertyTitles.map((title, idx) => (
            <Chip
              key={idx}
              label={title}
              size="small"
              clickable
              onClick={() => navigate(buildRoute(ROUTES.PROPERTY_DETAILS, inquiry.id))}
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Box>
      )}
    </Box>
  );

  // Date boxes
  const CreatedBox = (
    <Typography variant="body2">
      <strong>Fecha de envío:</strong> {created.format('D [de] MMM YYYY, HH:mm')}
    </Typography>
  );

  const ClosedBox = (
    <Typography variant="body2">
      <strong>Fecha de cierre:</strong> {closed ? closed.format('D [de] MMM YYYY, HH:mm') : '-'}
    </Typography>
  );

  // Description
  const DescriptionSection = (
    <Box>
      <Typography variant="body2">
        <strong>Descripción</strong>
      </Typography>
      <Typography variant="body2" color="text.primary">
        {inquiry.description}
      </Typography>
    </Box>
  );

  // Status chip for non-admin
  const StatusChip = (
    <Chip label={status.label} size="small" color="primary" variant="outlined" />
  );

  // Action button for admin: LoadingButton shows loader, disabled if closed
  const ActionButton = isClosed ? (
    <LoadingButton size="small" variant="outlined" disabled>
      Resuelta
    </LoadingButton>
  ) : (
    <LoadingButton
      size="small"
      variant="outlined"
      loading={loading}
      onClick={() => onResolve(inquiry.id)}
    >
      Marcar resuelta
    </LoadingButton>
  );

  return (
    <Card
      variant="outlined"
      sx={{ p: 2 }}
    >
      {/* Contacto */}
      {isAdmin && PropertyInfo}

      {/* Divider */}
      {isAdmin && <Divider sx={{ mb: 2 }} />}

      {isMobile ? (
        <Box display="flex" flexDirection="column" gap={2}>
          {CreatedBox}
          {ClosedBox}

          <Box display="flex" alignItems="center" justifyContent="space-between">
            {DescriptionSection}
            {!isAdmin && StatusChip}
          </Box>

          {isAdmin && (
            <Box display="flex" justifyContent="flex-end">
              {ActionButton}
            </Box>
          )}
        </Box>
      ) : (
        <Box display="flex" alignItems="center">
          <Box sx={{ minWidth: 200, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {CreatedBox}
            {ClosedBox}
          </Box>

          <Divider
            orientation="vertical"
            flexItem
            sx={{ mx: 3, bgcolor: theme.palette.grey[300] }}
          />

          <Box flex={1}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              {DescriptionSection}
              {!isAdmin && StatusChip}
            </Box>
          </Box>

          {isAdmin && <Box ml={3}>{ActionButton}</Box>}
        </Box>
      )}

      {/* Divider */}
      {isAdmin && <Divider sx={{ mt: 2 }} />}

      {/* Propiedades */}
      {ContactInfo}
    </Card>
  );
};
