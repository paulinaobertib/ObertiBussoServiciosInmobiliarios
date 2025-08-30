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
                <Grid container spacing={2} sx={{ alignItems: { xs: "flex-start", sm: "stretch" } }}>
                    {/* Título */}
                    <Grid
                        size={{ xs: 12, sm: 8 }}
                        sx={{ order: { xs: 1, sm: 1 }, minWidth: 0 }}
                    >
                        <TextField
                            label="Título"
                            fullWidth
                            size="small"
                            value={f.form.title}
                            onChange={(e) => f.setField("title", e.target.value)}
                        />
                    </Grid>

                    {/* Uploader (en sm va a la derecha; en xs queda 3ro) */}
                    <Grid
                        size={{ xs: 12, sm: 4 }}
                        sx={{ order: { xs: 3, sm: 2 }, minWidth: 0 }}
                    >
                        <Box sx={{ width: "100%", maxWidth: "100%", minWidth: 0 }}>
                            <ImageUploader
                                label="Imagen"
                                onSelect={(files) => f.setMain(files[0] ?? null)}
                                sx={{
                                    width: "100%",
                                    maxWidth: "100%",
                                    minWidth: 0,
                                    boxSizing: "border-box",
                                    "& *": { maxWidth: "100%" }, // evita que algún hijo se pase
                                }}
                            />
                        </Box>
                    </Grid>

                    {/* Descripción (en xs va 2do; en sm va debajo del título) */}
                    <Grid
                        size={{ xs: 12, sm: 8 }}
                        sx={{ order: { xs: 2, sm: 3 }, minWidth: 0 }}
                    >
                        <TextField
                            label="Descripción"
                            fullWidth
                            multiline
                            rows={4}
                            size="small"
                            value={f.form.description}
                            onChange={(e) => f.setField("description", e.target.value)}
                        />
                    </Grid>

                    {/* Preview (en xs va último; en sm a la derecha) */}
                    <Grid
                        size={{ xs: 12, sm: 4 }}
                        sx={{ order: { xs: 4, sm: 4 }, minWidth: 0 }}
                    >
                        <Box sx={{
                            width: "100%",
                            borderRadius: 1,
                            alignItems: "center",
                            display: "flex",
                            aspectRatio: { xs: "4 / 3", sm: 'auto' },
                            height: { xs: "auto", sm: "100%" }
                        }}>
                            <ImagePreview
                                fullSizeSingle
                                main={f.form.mainImage}
                                images={[]}
                                onDelete={() => f.setMain(null)}
                            />
                        </Box>
                    </Grid>
                </Grid>
            </Box >
        );
    }
);