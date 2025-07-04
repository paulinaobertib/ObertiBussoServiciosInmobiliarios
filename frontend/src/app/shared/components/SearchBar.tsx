import { useState, useEffect } from "react";
import { Box, TextField, InputAdornment, CircularProgress } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

type SearchBarProps = {
  fetchAll: () => Promise<any[]>;
  fetchByText: (q: string) => Promise<any[]>;
  onSearch: (results: any[]) => void;
  placeholder?: string;
  debounceMs?: number;
};

export const SearchBar = ({
  fetchAll,
  fetchByText,
  onSearch,
  placeholder = "Buscar…",
  debounceMs = 300,
}: SearchBarProps) => {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      const fn = q.trim() ? () => fetchByText(q.trim()) : fetchAll;
      fn()
        .then(onSearch)
        .catch(() => onSearch([]))
        .finally(() => setLoading(false));
    }, debounceMs);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <Box
      display="flex"
      alignItems="center"
      sx={{ width: "100%" }}
    >
      <TextField
        size="small"
        fullWidth
        placeholder={placeholder}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <CircularProgress
                size={18}
                sx={{ visibility: loading ? "visible" : "hidden" }}
              />
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
};