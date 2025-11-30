import { ReactNode } from "react";
import { Box, Button, Card, Collapse, SxProps, TextField, Theme, Typography } from "@mui/material";
import { Sparkles } from "lucide-react";
import { Property } from "../../../property/types/property";
import { SearchBar } from "../../../shared/components/SearchBar";
import { useAISearch } from "../../../property/hooks/useAISearch";
import { LoadingButton } from "@mui/lab";

interface AISearchProps {
  fetchByText: (value: string) => Promise<Property[]>;
  onSearch: (results: Property[] | null) => void;
  placeholder?: string;
  debounceMs?: number;
  sx?: SxProps<Theme>;
  compareSlot?: ReactNode;
  filterSlot?: ReactNode;
}

export const AISearch = ({
  fetchByText,
  onSearch,
  placeholder = "Buscar propiedad",
  debounceMs = 400,
  sx = {},
  compareSlot,
  filterSlot,
}: AISearchProps) => {
  const { isAIEnabled, enableAI, disableAI, prompt, setPrompt, loading, error, handleAISearch, handleKeyDown } =
    useAISearch({ onResults: onSearch });

  const hasCompareSlot = Boolean(compareSlot);
  const hasFilterSlot = Boolean(filterSlot);

  const toggleAI = () => {
    if (isAIEnabled) {
      disableAI();
      onSearch(null);
    } else {
      enableAI();
      onSearch(null);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        ...sx,
      }}
    >
      {/* Primera fila en móvil: 3 botones (Filtros, IA, Comparar) */}
      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          gap: 0.5,
          alignItems: "stretch",
          fontSize: "0.875rem",
          "& .MuiButton-root": { fontSize: "inherit" },
        }}
      >
        {/* Filtros móvil */}
        {hasFilterSlot && <Box sx={{ display: "flex", alignItems: "stretch", flex: "0 0 auto" }}>{filterSlot}</Box>}

        {/* Botón IA móvil */}
        <Button
          onClick={toggleAI}
          variant={isAIEnabled ? "contained" : "outlined"}
          size="small"
          sx={{
            flex: hasCompareSlot ? "0 0 auto" : 1,
            minWidth: hasCompareSlot ? "auto" : 0,
            px: 0.75,
            fontWeight: 600,
            textTransform: "none",
            whiteSpace: "normal",
            textAlign: "center",
            lineHeight: 1.2,
          }}
        >
          Busqueda Inteligente
        </Button>

        {/* Comparar móvil */}
        {hasCompareSlot && (
          <Box sx={{ display: "flex", alignItems: "stretch", flex: 1, minWidth: 0 }}>{compareSlot}</Box>
        )}
      </Box>

      {/* Segunda fila en móvil / Primera fila en desktop: SearchBar o contenido IA */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: hasCompareSlot ? "auto minmax(0,1fr) auto" : "auto minmax(0,1fr)",
          },
          columnGap: 1,
          rowGap: 1,
          alignItems: "stretch",
        }}
      >
        {/* Botón IA en desktop */}
        <Button
          onClick={toggleAI}
          variant={isAIEnabled ? "contained" : "outlined"}
          size="small"
          startIcon={<Sparkles size={18} />}
          sx={{
            display: { xs: "none", md: "flex" },
            gridColumn: "1 / 2",
            alignSelf: "stretch",
            minWidth: 140,
            fontWeight: 600,
            textTransform: "none",
            fontSize: { xs: "inherit", sm: "0.875rem" },
          }}
        >
          {isAIEnabled ? "Búsqueda Manual" : "Búsqueda Inteligente"}
        </Button>

        {/* SearchBar */}
        {!isAIEnabled && (
          <Box
            sx={{
              gridColumn: { xs: "1 / -1", md: "2 / 3" },
              width: "100%",
            }}
          >
            <SearchBar
              fetchByText={fetchByText}
              onSearch={onSearch}
              placeholder={placeholder}
              debounceMs={debounceMs}
            />
          </Box>
        )}

        {/* Comparar en desktop */}
        {hasCompareSlot && (
          <Box
            sx={{
              gridColumn: "3 / 4",
              display: { xs: "none", md: "flex" },
              alignItems: "stretch",
              justifyContent: "flex-end",
            }}
          >
            {compareSlot}
          </Box>
        )}

        {isAIEnabled && (
          <Box sx={{ gridColumn: "1 / -1" }}>
            <Collapse in={isAIEnabled} timeout={250} unmountOnExit>
              <Card
                sx={{
                  // border: (theme) => `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  p: { xs: 2, sm: 3 },
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  backgroundColor: "background.paper",
                }}
              >
                <Typography variant="subtitle2" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Sparkles size={18} />
                  Contanos qué estás buscando
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Escribí debajo como si le estuvieras contando a un agente inmobiliario que necesitás: zona que
                  preferís, cuántos ambientes, presupuesto, y cualquier detalle importante para vos. Segui el ejemplo:
                </Typography>

                <TextField
                  multiline
                  minRows={4}
                  placeholder="Ej: Busco una casa de 3 dormitorios en zona norte, con jardín y cerca de escuelas..."
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  onKeyDown={handleKeyDown as any}
                />

                {error && (
                  <Typography variant="caption" color="error">
                    {error}
                  </Typography>
                )}

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 1,
                  }}
                >
                  <LoadingButton
                    variant="contained"
                    onClick={handleAISearch}
                    disabled={loading || !prompt.trim()}
                    sx={{ textTransform: "none", fontWeight: 600 }}
                    loading={loading}
                  >
                    Comenzar Búsqueda
                  </LoadingButton>
                </Box>
              </Card>
            </Collapse>
          </Box>
        )}
      </Box>
    </Box>
  );
};
