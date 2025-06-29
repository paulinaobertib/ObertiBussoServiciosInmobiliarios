import { Button } from '@mui/material';

interface Props {
  label: string;
  active: boolean;
  onClick: () => void;
}

export const PanelButton = ({ label, active, onClick, }: Props) => {
  return (
    <Button
      variant={active ? 'contained' : 'outlined'}
      onClick={onClick}
      sx={{ textTransform: 'none', minWidth: 110 }}
    >
      {label}
    </Button>
  );
}
