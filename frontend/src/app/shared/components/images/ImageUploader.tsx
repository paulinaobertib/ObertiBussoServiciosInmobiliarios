import { Box, Typography } from '@mui/material';

interface Props {
    label: string;
    multiple?: boolean;
    sx?: any;
    append?: boolean;
    onSelect: (files: File[]) => void;
    imagesOnly?: boolean;
}

export const ImageUploader = ({ label, multiple = false, sx, append = false, onSelect, imagesOnly = false }: Props) => {
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
                p: 1.2,
                cursor: 'pointer',
                width: '100%',
                maxWidth: '100%',
                ...sx,
            }}
        >
            <input hidden type="file" accept={imagesOnly ? "image/*" : "image/*,video/*"} multiple={multiple} onChange={onChange} />
            <Typography variant="body2" sx={{
                textAlign: 'center', color: 'text.secondary'
            }}>{label}</Typography>
        </Box>
    );
}
