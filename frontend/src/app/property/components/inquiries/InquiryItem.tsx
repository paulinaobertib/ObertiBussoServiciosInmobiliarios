// src/app/shared/components/InquiryItem.tsx
import { Box, Typography, Button, Tooltip, useTheme } from '@mui/material';
import type { Inquiry } from '../../types/inquiry';

interface Props {
  inquiry: Inquiry;
  isAdmin: boolean;
  loading: boolean;
  onOpen: (inq: Inquiry) => void;
  onResolve: (id: number) => void;
}

export const InquiryItem = ({
  inquiry,
  isAdmin,
  loading,
  onOpen,
  onResolve,
}: Props) => {
  const theme = useTheme();
  const date = new Date(inquiry.date).toLocaleDateString();

  // columnas según rol
  const gridCols = isAdmin ? '3fr 1.5fr 1fr 1.5fr' : '1.5fr 3fr 75px';

  // estilo común
  const cellSx = {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  } as const;

  // estilo para descripción multilineada (máx. 2 líneas)
  const multiLineSx = {
    ...cellSx,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    whiteSpace: 'normal',
  } as const;

  // datos para móvil
  const mobileFields = [
    { label: 'Título', value: inquiry.title },
    { label: 'Fecha', value: date },
    {
      label: isAdmin ? 'Usuario' : 'Descripción',
      value: isAdmin
        ? `${inquiry.firstName} ${inquiry.lastName}`
        : inquiry.description,
    },
    { label: 'Estado', value: inquiry.status },
  ];

  return (
    <Box
      onClick={() => onOpen(inquiry)}
      sx={{
        display: { xs: 'block', sm: 'grid' },
        gridTemplateColumns: gridCols,
        alignItems: 'center',
        py: 1,
        borderBottom: `1px solid ${theme.palette.divider}`,
        cursor: 'pointer',
        '&:hover': { backgroundColor: theme.palette.action.hover },
      }}
    >
      {/* ===== MOBILE ===== */}
      <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
        {mobileFields.map(f => (
          <Box key={f.label} sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
            <Typography fontWeight={600}>{f.label}:</Typography>
            <Tooltip title={f.value} arrow>
              <Typography noWrap sx={cellSx}>
                {f.value}
              </Typography>
            </Tooltip>
          </Box>
        ))}
        {isAdmin && (
          <Box onClick={e => e.stopPropagation()} sx={{ textAlign: 'right', mt: 0.5 }}>
            {inquiry.status === 'ABIERTA' ? (
              <Button
                variant="contained"
                size="small"
                disabled={loading}
                onClick={() => onResolve(inquiry.id)}
              >
                Marcar resuelta
              </Button>
            ) : (
              <Typography color="text.secondary">—</Typography>
            )}
          </Box>
        )}
      </Box>

      {/* ===== DESKTOP ===== */}
      {/* Título + Fecha */}
      <Box sx={{ display: { xs: 'none', sm: 'block' }, pl: 0, ...cellSx }}>
        <Tooltip title={inquiry.title} arrow>
          <Typography variant="body2" noWrap>
            {inquiry.title}
          </Typography>
        </Tooltip>
        <Typography variant="caption" color="text.secondary" noWrap>
          {date}
        </Typography>
      </Box>

      {/* Usuario o Descripción (multilínea si no es admin) */}
      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
        {isAdmin ? (
          <Tooltip title={`${inquiry.firstName} ${inquiry.lastName}`} arrow>
            <Typography variant="body2" noWrap sx={cellSx}>
              {inquiry.firstName} {inquiry.lastName}
            </Typography>
          </Tooltip>
        ) : (
          <Tooltip title={inquiry.description} arrow>
            <Typography variant="body2" sx={multiLineSx}>
              {inquiry.description}
            </Typography>
          </Tooltip>
        )}
      </Box>

      {/* Estado */}
      <Box sx={{ display: { xs: 'none', sm: 'block' }, ...cellSx }}>
        <Tooltip title={inquiry.status} arrow>
          <Typography variant="body2" noWrap>
            {inquiry.status}
          </Typography>
        </Tooltip>
      </Box>

      {/* Acción (alineada a la derecha) */}
      {isAdmin && (
        <Box
          onClick={e => e.stopPropagation()}
          sx={{
            display: { xs: 'none', sm: 'flex' },
            justifySelf: 'end',
            textAlign: 'right',
            ...cellSx,
          }}
        >
          {inquiry.status === 'ABIERTA' ? (
            <Button
              variant="contained"
              size="small"
              disabled={loading}
              onClick={() => onResolve(inquiry.id)}
            >
              Marcar resuelta
            </Button>
          ) : (
            <Typography color="text.secondary">—</Typography>
          )}
        </Box>
      )}
    </Box>
  );
};
