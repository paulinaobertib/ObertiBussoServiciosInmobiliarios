import { Box, Stack } from '@mui/material';
import { ReactNode } from 'react';
import { PanelButton } from './PanelButton';
import { usePanelManager } from '../hooks/usePanelManager';

export interface PanelConfig {
  key: string;
  label: string;
  content: ReactNode;
  ButtonComponent?: React.ComponentType<{
    active: boolean;
    onClick: () => void;
  }>;
}

interface Props {
  panels: PanelConfig[];
  direction?: 'row' | 'column';
}

export const PanelManager = ({ panels, direction = 'row' }: Props) => {
  const keys = panels.map(p => p.key);
  const { open, toggle } = usePanelManager(keys);

  return (
    <>
      {/* Botones con scroll horizontal */}
      <Box
        sx={{
          overflowX: 'auto',
          overflowY: 'hidden',
          width: '100%',
        }}
      >
        <Stack
          direction={direction}
          spacing={1}
          sx={{
            flexWrap: 'nowrap',
            width: 'max-content',
          }}
        >
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
      </Box>

      {/* Contenido de panel */}
      {panels.map(p =>
        open[p.key] ? (
          <Box
            key={p.key}
            sx={{
              flex: 1,
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
};
