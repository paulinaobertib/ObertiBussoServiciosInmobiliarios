import { Box, Stack } from '@mui/material';
import { ReactNode } from 'react';
import PanelButton from './PanelButton';
import { usePanelManager } from '../hooks/usePanelManager';

export interface PanelConfig {
  key: string;
  label: string;
  content: ReactNode;
  /** Opcional: botón personalizado */
  ButtonComponent?: React.ComponentType<{
    active: boolean;
    onClick: () => void;
  }>;
}

interface Props {
  panels: PanelConfig[];
  /** fila o columna en los botones */
  direction?: 'row' | 'column';
}

/**
 * Muestra una hilera/columna de botones (uno por panel),
 * y luego renderiza cada panel sólo si está “open”.
 */
export default function PanelManager({
  panels,
  direction = 'row',
}: Props) {
  const keys = panels.map(p => p.key);
  const { open, toggle } = usePanelManager(keys);

  return (
    <>
      {/* botones */}
      <Stack direction={direction} spacing={1}>
        {panels.map(p => {
          const isActive = open[p.key];
          const handle = () => toggle(p.key);

          if (p.ButtonComponent) {
            const B = p.ButtonComponent;
            return <B key={p.key} active={isActive} onClick={handle} />;
          }
          return (
            <PanelButton
              key={p.key}
              label={p.label}
              active={isActive}
              onClick={handle}
            />
          );
        })}
      </Stack>

      {/* contenido */}
      {panels.map(p =>
        open[p.key] ? (
          <Box
            key={p.key}
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
              mb: 2,
              mt: 2,
              bgcolor: 'background.paper',
              boxShadow: 4,
              borderRadius: 2,
              width: '100%',

            }}
          >
            {p.content}
          </Box>
        ) : null
      )}
    </>
  );
}
