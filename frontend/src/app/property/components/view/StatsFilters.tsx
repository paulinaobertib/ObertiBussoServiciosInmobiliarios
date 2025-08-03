import { Paper, Stack, Chip, Typography, Divider, useTheme } from '@mui/material';

type Category = 'views' | 'inquiry' | 'survey';
const LABELS: Record<Category, string> = {
    views: 'Vistas',
    inquiry: 'Consultas',
    survey: 'Encuestas',
};

interface Props {
    selected: Category[];
    onChange: (cats: Category[]) => void;
}

export default function StatsFilters({ selected, onChange }: Props) {
    const theme = useTheme();

    return (
        <Paper
            elevation={1}
            sx={{
                p: 2,
                mb: 4,
                borderRadius: 2,
                bgcolor: theme.palette.background.paper,
            }}
        >
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Filtrar por categoría
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack direction="row" spacing={1} flexWrap="wrap">
                {(['views', 'inquiry', 'survey'] as Category[]).map((cat) => {
                    const active = selected.includes(cat);
                    return (
                        <Chip
                            key={cat}
                            label={LABELS[cat]}
                            clickable
                            variant={active ? 'filled' : 'outlined'}
                            color={active ? 'primary' : 'default'}
                            onClick={() =>
                                onChange(
                                    active
                                        ? selected.filter((c) => c !== cat)
                                        : [...selected, cat]
                                )
                            }
                            sx={{
                                textTransform: 'none',
                                fontWeight: active ? 600 : 400,
                                borderRadius: 2,
                                '& .MuiChip-label': { px: 1.5 },
                            }}
                        />
                    );
                })}
            </Stack>
        </Paper>
    );
}
