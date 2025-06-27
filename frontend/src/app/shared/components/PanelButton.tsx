import { Button } from '@mui/material';

interface Props {
  label: string;
  active: boolean;
  onClick: () => void;
}

export default function PanelButton({
  label,
  active,
  onClick,
}: Props) {
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
