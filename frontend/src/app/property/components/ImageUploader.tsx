import { Box, Typography } from '@mui/material';

interface Props {
    label: string;
    multiple?: boolean;
    sx?: any;
    append?: boolean;          // NUEVO: concatenar en vez de reemplazar
    onSelect: (files: File[]) => void;
}


export default function ImageUploader({ label, multiple = false, sx, append = false, onSelect, }: Props) {
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const files = Array.from(e.target.files);
        onSelect(append ? files : files.slice(0, multiple ? files.length : 1));
        e.target.value = '';
    };

    return (
        <Box
            component="label"
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                border: '1px dashed',
                borderColor: 'grey.500',
                borderRadius: 1,
                p: 2,
                cursor: 'pointer',
                maxHeight: { xs: '50%', md: '50%' },
                ...sx,
            }}
        >
            <input hidden type="file" accept="image/*" multiple={multiple} onChange={onChange} />
            <Typography variant="body2" sx={{ textAlign: 'center' }}>{label}</Typography>
        </Box>
    );
}
