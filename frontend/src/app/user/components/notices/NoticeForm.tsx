import { forwardRef, useImperativeHandle } from "react";
import { Box, Grid, TextField } from "@mui/material";
import { ImageUploader } from "../../../shared/components/images/ImageUploader";
import { ImagePreview } from "../../../shared/components/images/ImagePreview";
import { useNoticeForm } from "../../hooks/useNoticeForm";

export type NoticeFormHandle = {
    validate: () => boolean;
    getCreateData: () => any;
    getUpdateData: () => any;
};

export const NoticeForm = forwardRef<NoticeFormHandle, any>(
    ({ initialData, onValidityChange }, ref) => {
        const f = useNoticeForm(initialData, onValidityChange);

        useImperativeHandle(ref, () => ({
            validate: f.validate,
            getCreateData: f.getCreateData,
            getUpdateData: f.getUpdateData,
        }));

        return (
            <Box component="form" noValidate onSubmit={(e) => e.preventDefault()}>
                {/* Contenedor flex que estira filas al máximo */}
                <Grid container spacing={2} alignItems="stretch">
                    {/* ────────── Fila 1 ────────── */}
                    <Grid size={{ xs: 12, md: 8 }}>
                        <TextField
                            label="Título"
                            fullWidth
                            size="small"
                            value={f.form.title}
                            onChange={(e) => f.setField("title", e.target.value)}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }} sx={{ display: "flex", alignItems: "center" }}>
                        <ImageUploader
                            label="Imagen"
                            onSelect={(files) => f.setMain(files[0] ?? null)}
                            sx={{ width: "100%" }}
                        />
                    </Grid>

                    {/* ────────── Fila 2 ────────── */}
                    <Grid size={{ xs: 12, md: 8 }}>
                        <TextField
                            label="Descripción"
                            fullWidth
                            multiline
                            rows={5}
                            size="small"
                            value={f.form.description}
                            onChange={(e) => f.setField("description", e.target.value)}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }} sx={{}}>
                        <Box
                            sx={{
                                width: "100%",
                                height: "100%",
                                borderColor: "grey.400",
                                borderRadius: 1,
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            <ImagePreview
                                fullSizeSingle
                                main={f.form.mainImage}
                                images={[]}
                                onDelete={() => f.setMain(null)}
                            />
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        );
    }
);
