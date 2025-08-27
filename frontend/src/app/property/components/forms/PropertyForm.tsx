import { Box, Grid, TextField, MenuItem, InputAdornment, IconButton, Typography, Checkbox, Stack } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { ImageUploader } from "../../../shared/components/images/ImageUploader";
import { usePropertyForm } from "../../hooks/usePropertyForm";
import type { Property, PropertyCreate, PropertyUpdate } from "../../types/property";
import { forwardRef, useEffect } from "react";
import React from "react";
import { AddressSelector } from "../propertyDetails/maps/AddressSelector";

/* ─────────── ref API ─────────── */
export type PropertyFormHandle = {
  submit: () => Promise<boolean>;
  reset: () => void;
  deleteImage: (file: File | string) => void;
  setField: <K extends keyof Property>(key: K, value: Property[K]) => void;
  getCreateData: () => PropertyCreate;
  getUpdateData: () => PropertyUpdate;
};

type Img = File | string;
type ImagesApi = {
  mainImage: Img | null;
  gallery: Img[];
  setMain: (img: Img | null) => void;
  addToGallery: (items: Img[] | Img) => void;
  remove: (img: Img) => void;
};

interface Props {
  /** Fuente única de verdad para imágenes (provista por el Page) */
  img: ImagesApi;
  onValidityChange?: (valid: boolean) => void;
  initialData?: Property;
}

/* ─────────── componente ─────────── */
export const PropertyForm = forwardRef<PropertyFormHandle, Props>(function PropertyForm(
  { img, onValidityChange, initialData },
  ref
) {
  /* Hook de campos (sin manejar imágenes aquí) */
  const ctrl = usePropertyForm(initialData, undefined, onValidityChange);

  const DEBUG = true;

  /* expone métodos imperativos */
  React.useImperativeHandle(ref, () => ({
    submit: ctrl.submit,
    reset: ctrl.reset,
    deleteImage: ctrl.remove, // ← usa la API del Page
    setField: ctrl.setField as any,
    getCreateData: ctrl.getCreateData,
    getUpdateData: ctrl.getUpdateData,
  }));

  /* Alias para mayor legibilidad */
  const { form, fieldErrors, num, showRooms, showBedrooms, showBathrooms, showCoveredArea, colSize } = ctrl;

  const keyOf = (x: Img) => (x instanceof File ? `${x.name}#${x.size}#${x.lastModified}` : x);

  useEffect(() => {
    const main = img.mainImage ?? null;
    const gal = Array.isArray(img.gallery) ? img.gallery : [];
    const mainK = main ? keyOf(main) : null;
    const nextGallery = mainK ? gal.filter((g) => keyOf(g) !== mainK) : gal;

    const formMainK = form.mainImage ? keyOf(form.mainImage as any) : null;
    const formGal = ((form.images as any) ?? []) as Img[];

    const mainChanged = formMainK !== mainK;
    const galleryChanged =
      formGal.length !== nextGallery.length || formGal.some((g, i) => keyOf(g) !== keyOf(nextGallery[i]));

    if (mainChanged) ctrl.setField("mainImage" as any, (main ?? "") as any);
    if (galleryChanged) ctrl.setField("images" as any, nextGallery as any);
  }, [img.mainImage, img.gallery, form.mainImage, form.images]);

  useEffect(() => {
    if (!DEBUG) return;
    console.log("[FORM] change → form:", form);
  }, [form]);

  /* ───────────────────── RENDER ───────────────────── */
  return (
    <Box
      component="form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        ctrl.submit();
      }}
    >
      <Grid container spacing={1.5} columns={12}>
        {/* ---------- TÍTULO ---------- */}
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Título"
            value={form.title}
            onChange={(e) => ctrl.setField("title", e.target.value)}
            required
            error={!!fieldErrors.title}
            size="small"
          />
        </Grid>

        {/* ---------- OPERACIÓN / ESTADO ---------- */}
        <Grid size={{ xs: 6 }}>
          <TextField
            select
            fullWidth
            label="Operación"
            value={form.operation}
            onChange={(e) => ctrl.setField("operation", e.target.value)}
            required
            error={!!fieldErrors.operation}
            size="small"
          >
            <MenuItem value="VENTA">Venta</MenuItem>
            <MenuItem value="ALQUILER">Alquiler</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 6 }}>
          <TextField
            select
            fullWidth
            label="Estado"
            value={form.status}
            onChange={(e) => ctrl.setField("status", e.target.value)}
            required
            error={!!fieldErrors.status}
            size="small"
          >
            <MenuItem value="DISPONIBLE">Disponible</MenuItem>
            <MenuItem value="VENDIDA">Vendida</MenuItem>
            <MenuItem value="ALQUILADA">Alquilada</MenuItem>
            <MenuItem value="RESERVADA">Reservada</MenuItem>
          </TextField>
        </Grid>

        {/* ---------- CRÉDITO / FINANCIACIÓN ---------- */}
        {form.operation === "VENTA" && (
          <>
            <Grid size={{ xs: 6 }}>
              <Stack
                direction="row"
                alignItems="center"
                px={1}
                py={0.5}
                sx={{ border: "1px solid #ccc", borderRadius: 1, "&:hover": { borderColor: "#444" } }}
              >
                <Checkbox
                  checked={form.credit}
                  onChange={(e) => ctrl.setField("credit", e.target.checked)}
                  size="small"
                  sx={{ p: 0.7 }}
                />
                <Typography color="text.secondary"> Apto Crédito</Typography>
              </Stack>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Stack
                direction="row"
                alignItems="center"
                px={1}
                py={0.5}
                sx={{ border: "1px solid #ccc", borderRadius: 1, "&:hover": { borderColor: "#444" } }}
              >
                <Checkbox
                  checked={form.financing}
                  onChange={(e) => ctrl.setField("financing", e.target.checked)}
                  size="small"
                  sx={{ p: 0.7 }}
                />
                <Typography color="text.secondary">Apto Financiamiento</Typography>
              </Stack>
            </Grid>
          </>
        )}

        {/* ---------- PRECIO / MONEDA / EXPENSAS ---------- */}
        <Grid size={{ xs: 6 }}>
          <TextField
            select
            fullWidth
            label="Moneda"
            value={form.currency}
            onChange={(e) => ctrl.setField("currency", e.target.value)}
            required
            error={!!fieldErrors.currency}
            size="small"
          >
            <MenuItem value="ARS">Peso Argentino</MenuItem>
            <MenuItem value="USD">Dólar</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 6 }}>
          <TextField
            fullWidth
            label="Precio"
            value={form.price === 0 ? "" : form.price}
            onChange={num("price")}
            required
            error={!!fieldErrors.price}
            inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
            size="small"
          />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <TextField disabled fullWidth label="Moneda Expensas" value="Peso Argentino" size="small" />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <TextField
            fullWidth
            label="Expensas"
            value={form.expenses ?? ""}
            onChange={num("expenses")}
            required
            error={!!fieldErrors.expenses}
            inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => ctrl.setField("expenses", 0 as any)}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* ---------- MOSTRAR PRECIO ---------- */}
        <Grid size={{ xs: 8 }}>
          <Stack
            direction="row"
            alignItems="center"
            px={1}
            py={0.5}
            sx={{ border: "1px solid #ccc", borderRadius: 1, "&:hover": { borderColor: "#444" } }}
          >
            <Checkbox
              checked={form.showPrice}
              onChange={(e) => ctrl.setField("showPrice", e.target.checked)}
              size="small"
              sx={{ p: 0.7 }}
            />
            <Typography noWrap color="text.secondary">
              Mostrar precio de {form.operation === "VENTA" ? "venta" : "alquiler"} y expensas
            </Typography>
          </Stack>
        </Grid>

        {/* ---------- MOSTRAR COMO PROPIEDAD DESTACADA ---------- */}
        <Grid size={{ xs: 4 }}>
          <Stack
            direction="row"
            alignItems="center"
            px={1}
            py={0.5}
            sx={{ border: "1px solid #ccc", borderRadius: 1, "&:hover": { borderColor: "#444" } }}
          >
            <Checkbox
              checked={form.outstanding}
              onChange={(e) => ctrl.setField("outstanding", e.target.checked)}
              size="small"
              sx={{ p: 0.7 }}
            />
            <Typography color="text.secondary">Destacar</Typography>
          </Stack>
        </Grid>

        {/* ---------- DESCRIPCIÓN ---------- */}
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Descripción"
            value={form.description}
            onChange={(e) => ctrl.setField("description", e.target.value)}
            required
            error={!!fieldErrors.description}
            size="small"
          />
        </Grid>

        {/* ---------- DIRECCIÓN ---------- */}
        <Grid size={{ xs: 12 }}>
          <AddressSelector
            neighborhoodId={form.neighborhood.id}
            neighborhoodName={form.neighborhood.name}
            value={{ street: form.street, number: form.number }}
            onChange={({ street, number }) => {
              ctrl.setField("street", street);
              ctrl.setField("number", number);
            }}
          />
        </Grid>

        {/* ---------- AMBIENTES DINÁMICOS ---------- */}
        {showRooms && (
          <Grid size={{ xs: colSize }}>
            <TextField
              fullWidth
              label="Ambientes"
              value={form.rooms === 0 ? "" : form.rooms}
              onChange={num("rooms")}
              required
              error={!!fieldErrors.rooms}
              size="small"
            />
          </Grid>
        )}
        {showBedrooms && (
          <Grid size={{ xs: colSize }}>
            <TextField
              fullWidth
              label="Dormitorios"
              value={form.bedrooms === 0 ? "" : form.bedrooms}
              onChange={num("bedrooms")}
              required
              error={!!fieldErrors.bedrooms}
              size="small"
            />
          </Grid>
        )}
        {showBathrooms && (
          <Grid size={{ xs: colSize }}>
            <TextField
              fullWidth
              label="Baños"
              value={form.bathrooms === 0 ? "" : form.bathrooms}
              onChange={num("bathrooms")}
              required
              error={!!fieldErrors.bathrooms}
              helperText={fieldErrors.bathrooms}
              size="small"
            />
          </Grid>
        )}
        <Grid size={{ xs: showCoveredArea ? 6 : 12 }}>
          <TextField
            fullWidth
            label="Superficie Total"
            value={form.area === 0 ? "" : form.area}
            onChange={num("area")}
            required
            error={!!fieldErrors.area}
            size="small"
          />
        </Grid>
        {showCoveredArea && (
          <Grid size={{ xs: 6 }}>
            <TextField
              fullWidth
              label="Superficie Cubierta"
              value={form.coveredArea === 0 ? "" : form.coveredArea}
              onChange={num("coveredArea")}
              required
              error={!!fieldErrors.coveredArea}
              helperText={fieldErrors.coveredArea}
              size="small"
            />
          </Grid>
        )}

        {/* ---------- IMÁGENES (usan API del Page) ---------- */}
        <Grid size={{ xs: 6 }}>
          <ImageUploader
            imagesOnly
            label="Imagen principal"
            onSelect={(files) => {
              const f = files?.[0] ?? null;
              // 1) actualizar la “fuente única” (hook img)
              img.setMain(f);

              // 2) reflejar inmediatamente en el form (lo que valida submit)
              ctrl.setField("mainImage" as any, (f ?? "") as any);
            }}
            sx={{ width: "auto" }}
          />
        </Grid>

        <Grid size={{ xs: 6 }}>
          <ImageUploader
            label="Imágenes adicionales"
            multiple
            append
            onSelect={(files) => {
              const add = Array.isArray(files) ? files : [files];

              // 1) actualizar la “fuente única”
              img.addToGallery(add);

              // 2) reflejar en el form.images (lo que mira la validación)
              const current = ((ctrl.form.images as any) ?? []) as Img[];
              ctrl.setField("images" as any, [...current, ...add] as any);
            }}
            sx={{ width: "auto" }}
          />
        </Grid>
      </Grid>
    </Box>
  );
});
