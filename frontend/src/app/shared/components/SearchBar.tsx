import { useState, useEffect, useRef } from "react";
import { Box, TextField, InputAdornment, CircularProgress } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

type SearchBarProps = {
  data?: any[];
  fetchAll?: () => Promise<any[]>;
  fetchByText?: (q: string) => Promise<any[]>;
  onSearch: (results: any[] | null) => void;
  placeholder?: string;
  debounceMs?: number;
  localFilterFields?: string[]; // NUEVO: para filtrar localmente por campos específicos
};

export const SearchBar = ({
  data = [],
  fetchAll,
  fetchByText,
  onSearch,
  placeholder = "Buscar...",
  debounceMs = 300,
  localFilterFields = [], // por defecto ninguno
}: SearchBarProps) => {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const isInitial = useRef(true);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        if (q.trim()) {
          if (fetchByText) {
            // Remoto si hay función
            const results = await fetchByText(q.trim());
            onSearch(results);
          } else {
            // LOCAL, sólo por los campos indicados
            const lower = q.trim().toLowerCase();
            const filtered = data.filter((item) =>
              (localFilterFields.length > 0 ? localFilterFields : Object.keys(item)).some((key) =>
                String(item[key] ?? "")
                  .toLowerCase()
                  .includes(lower)
              )
            );
            onSearch(filtered);
          }
        } else {
          // Vacío: si es inicial, no hacer nada, dejar que cargue el componente padre
          if (!isInitial.current) {
            if (fetchAll) {
              const results = await fetchAll();
              onSearch(results);
            } else {
              onSearch(null);
            }
          }
        }
      } catch {
        onSearch([]);
      } finally {
        setLoading(false);
        isInitial.current = false;
      }
    }, debounceMs);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <Box display="flex" alignItems="center" sx={{ width: "100%" }}>
      <TextField
        size="small"
        fullWidth
        placeholder={placeholder}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <CircularProgress size={18} sx={{ visibility: loading ? "visible" : "hidden" }} />
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
};
