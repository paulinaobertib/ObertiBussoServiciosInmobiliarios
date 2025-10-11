import { Box, useTheme, useMediaQuery, Button } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useNavigate } from "react-router-dom";
import { ImageCarousel } from "../app/shared/components/images/ImageCarousel";
import { SearchBar } from "../app/shared/components/SearchBar";
import { SearchFilters } from "../app/property/components/catalog/SearchFilters";
import { PropertyCatalog } from "../app/property/components/catalog/PropertyCatalog";
import { FloatingButtons } from "../app/property/components/catalog/FloatingButtons";
import { useGlobalAlert } from "../app/shared/context/AlertContext";
import { Property } from "../app/property/types/property";
import { BasePage } from "./BasePage";
import { usePropertiesContext } from "../app/property/context/PropertiesContext";
import {
  getAllProperties,
  getAvailableProperties,
  getPropertiesByText,
} from "../app/property/services/property.service";
import { useEffect, useState } from "react";
import { useAuthContext } from "../app/user/context/AuthContext";
import { Snackbar, Alert } from "@mui/material";

export default function Home() {
  localStorage.setItem("selectedPropertyId", "");
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { isAdmin } = useAuthContext();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "info" | "warning" }>({
      open: false,
      message: "",
      severity: "info",
  });

  const alertApi: any = useGlobalAlert();
  const notifyInfo = (title: string, description?: string) => {
    if (typeof alertApi?.info === "function") return alertApi.info({ title, description, primaryLabel: "Ok" });
    if (typeof alertApi?.showAlert === "function") return alertApi.showAlert(description ?? title, "info");
  };
  const notifyWarn = (title: string, description?: string) => {
    if (typeof alertApi?.warning === "function")
      return alertApi.warning({ title, description, primaryLabel: "Entendido" });
    if (typeof alertApi?.showAlert === "function") return alertApi.showAlert(description ?? title, "warning");
  };

  const { selectedPropertyIds, toggleCompare, clearComparison, disabledCompare, refreshProperties, resetSelected } =
    usePropertiesContext();

  const [mode, setMode] = useState<"normal" | "edit" | "delete">("normal");
  const [selectionMode, setSelectionMode] = useState(false);
  const [results, setResults] = useState<Property[] | null>(null);

  useEffect(() => {
    resetSelected();
    refreshProperties(isAdmin ? "all" : "available");
  }, [resetSelected, refreshProperties, isAdmin]);

  const handleAction = (action: "create" | "edit" | "delete") => {
    if (action === "create") {
      navigate("/properties/new");
      return;
    }
    if (mode === action) {
      setMode("normal");
      notifyInfo(action === "delete" ? "Saliste del modo eliminación" : "Saliste del modo edición");
    } else {
      setMode(action);
      if (action === "delete") {
        notifyWarn("Modo eliminación: selecciona una propiedad");
      } else {
        notifyInfo("Modo edición: selecciona una propiedad");
      }
    }
  };

    const toggleSelectionMode = () =>
        setSelectionMode((prev) => {
            const next = !prev;
            setSnackbar({
                open: true,
                message: next ? "Entrando al modo comparación" : "Saliendo del modo comparación",
                severity: "info",
            });
            if (!next) clearComparison();
            return next;
        });

    const handleCompare = () => {
    if (disabledCompare) {
      notifyWarn("Debes seleccionar 2 o 3 propiedades");
      return;
    }
    navigate("/properties/compare", { state: { ids: selectedPropertyIds } });
    setSelectionMode(false);
  };

  return (
    <BasePage maxWidth={false}>
      <Box sx={{ p: 2 }}>
        <ImageCarousel />

        {/* ── SearchBar con botón FILTROS a la izquierda (solo mobile) ── */}
        <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
          <Box
            sx={{
              width: isMobile ? "100%" : "40rem",
              display: "flex",
              flexDirection: "row",
              gap: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isMobile && (
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={() => setFiltersOpen(true)}
                sx={{ flexShrink: 0 }}
              >
                Filtros
              </Button>
            )}

            <Box sx={{ flexGrow: 1 }}>
              <SearchBar
                fetchAll={isAdmin ? getAllProperties : getAvailableProperties}
                fetchByText={async (value) => {
                  const results = await getPropertiesByText(value);
                  return isAdmin
                    ? results
                    : (results ?? []).filter((p: any) => String(p?.status ?? "").toUpperCase() === "DISPONIBLE");
                }}
                onSearch={(items) => setResults(items as Property[])}
                placeholder="Buscar propiedad"
                debounceMs={400}
              />
            </Box>
          </Box>
        </Box>

        {/* ── Filtros + catálogo ── */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 1,
            mt: 2,
          }}
        >
          <Box sx={{ width: { md: 300 } }}>
            <SearchFilters
              onSearch={setResults}
              mobileOpen={filtersOpen}
              onMobileOpenChange={setFiltersOpen}
              hideMobileTrigger
            />
          </Box>

          <Box sx={{ flexGrow: 1, ml: { md: 3 } }}>
            <PropertyCatalog
              {...(results !== null ? { properties: results } : {})}
              mode={mode}
              onFinishAction={() => {
                setMode("normal");
                setResults(null);
              }}
              selectionMode={selectionMode}
              toggleSelection={toggleCompare}
              isSelected={(id) => selectedPropertyIds.includes(id)}
            />
          </Box>
        </Box>
      </Box>

      <FloatingButtons
        onAction={handleAction}
        selectionMode={selectionMode}
        toggleSelectionMode={toggleSelectionMode}
        onCompare={handleCompare}
      />

      <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
          <Alert
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              severity={snackbar.severity}
              sx={{
                  width: "100%",
                  backgroundColor: "#EB7333",
                  color: "white",
                  '& .MuiAlert-icon': {
                      color: 'white',
                  },
              }}
          >
              {snackbar.message}
          </Alert>
      </Snackbar>

    </BasePage>
  );
}
