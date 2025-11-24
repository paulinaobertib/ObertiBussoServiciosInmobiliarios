import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Popper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import MapIcon from "@mui/icons-material/Map";
import CloseIcon from "@mui/icons-material/Close";
import ErrorIcon from "@mui/icons-material/Error";

import { getNeighborhoodById } from "../../../services/neighborhood.service";
import {
  fetchPlaceSuggestions,
  geocodeForward,
  parseAddressComponents,
  PlaceSuggestion,
  reverseGeocode,
} from "../../../services/googleMaps.service";
import { loadGoogleMapsSdk } from "../../../utils/googleMapsLoader";

const GEOCODE_DELAY_MS = (window as any).Cypress ? 100 : 5000;
const AUTOCOMPLETE_DEBOUNCE_MS = 500; // Aumentado de 350ms a 500ms
const MIN_CHARS_FOR_AUTOCOMPLETE = 3; // Mínimo de caracteres antes de buscar

export interface AddressValue {
  street: string;
  number: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface AddressSelectorProps {
  neighborhoodId: number;
  neighborhoodName: string;
  value: AddressValue;
  onChange: (value: AddressValue) => void;
}

type Status = "idle" | "waiting" | "loading" | "success" | "warning" | "error";
type InteractionSource = "manual" | "auto" | "map";

type MapCoords = { lat: number; lng: number };

const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const buildAddressString = (value: AddressValue, neighborhoodName: string) => {
  const base = `${value.street} ${value.number}`.trim();
  if (!base) return "";
  const suffix = neighborhoodName ? `, ${neighborhoodName}, Córdoba, Argentina` : ", Córdoba, Argentina";
  return `${base}${suffix}`;
};

const createToken = () =>
  typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);

export const AddressSelector = ({ neighborhoodId, neighborhoodName, value, onChange }: AddressSelectorProps) => {
  const safeValue = useMemo<AddressValue>(
    () => ({
      street: value?.street ?? "",
      number: value?.number ?? "",
      latitude: value?.latitude ?? null,
      longitude: value?.longitude ?? null,
    }),
    [value]
  );

  const [loadingNeighborhood, setLoadingNeighborhood] = useState(false);
  const [neighborhoodCenter, setNeighborhoodCenter] = useState<MapCoords | null>(null);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [autocompleteLoading, setAutocompleteLoading] = useState(false);
  const [streetFocused, setStreetFocused] = useState(false);
  const [forwardStatus, setForwardStatus] = useState<Status>("idle");
  const [reverseStatus, setReverseStatus] = useState<Status>("idle");
  const [neighborhoodMatch, setNeighborhoodMatch] = useState<boolean | null>(null);
  const [provinceMatch, setProvinceMatch] = useState<boolean | null>(null);
  const [openMap, setOpenMap] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const [pendingCoords, setPendingCoords] = useState<MapCoords | null>(null);
  const [lastInteraction, setLastInteraction] = useState<InteractionSource>("auto");

  // Estados internos para manejar datos temporales de Google Maps (no se propagan al form)
  const [internalPlaceId, setInternalPlaceId] = useState<string>("");

  const sessionTokenRef = useRef<string | null>(null);
  const forwardTimerRef = useRef<number | undefined>(undefined);
  const reverseTimerRef = useRef<number | undefined>(undefined);
  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any | null>(null);
  const markerRef = useRef<any | null>(null);
  const mapListenerRef = useRef<any | null>(null);
  const autocompleteAbortRef = useRef<AbortController | null>(null);
  const streetInputRef = useRef<HTMLDivElement | null>(null);

  const disabled = neighborhoodId <= 0;
  const showSuggestions = streetFocused && suggestions.length > 0;

  const applyChange = (patch: Partial<AddressValue>, source: InteractionSource) => {
    setLastInteraction(source);
    onChange({ ...safeValue, ...patch });
  };

  const clearForwardTimer = () => {
    if (forwardTimerRef.current) window.clearTimeout(forwardTimerRef.current);
  };

  const clearReverseTimer = () => {
    if (reverseTimerRef.current) window.clearTimeout(reverseTimerRef.current);
  };

  const handleCloseMap = () => {
    setOpenMap(false);
    setPendingCoords(null);
    setReverseStatus("idle");
    clearReverseTimer();
    // NO destruimos las instancias, las mantenemos en memoria para reutilizarlas
  };

  const handleStreetChange = (street: string) => {
    // Cancelar request de autocompletado anterior si existe
    if (autocompleteAbortRef.current) {
      autocompleteAbortRef.current.abort();
      autocompleteAbortRef.current = null;
    }

    applyChange(
      {
        street,
        latitude: null,
        longitude: null,
      },
      "manual"
    );
    setForwardStatus("idle");
    setInternalPlaceId(""); // Limpiar placeId interno
  };

  const handleNumberChange = (number: string) => {
    applyChange(
      {
        number,
        latitude: null,
        longitude: null,
      },
      "manual"
    );
    setForwardStatus("idle");
  };

  const handleSuggestionSelect = (suggestion: PlaceSuggestion) => {
    setInternalPlaceId(suggestion.placeId);
    setSuggestions([]);
    setStreetFocused(false);

    // Aplicar cambio después de limpiar sugerencias para evitar retriggering
    requestAnimationFrame(() => {
      applyChange(
        {
          street: suggestion.mainText,
        },
        "manual"
      );
    });
  };

  const updateFromGeocode = (
    result: Awaited<ReturnType<typeof geocodeForward>> | Awaited<ReturnType<typeof reverseGeocode>>,
    source: InteractionSource
  ) => {
    if (!result) {
      setForwardStatus("error");
      return;
    }

    const parsed = parseAddressComponents(result.components);
    const normalizedNeighborhood = normalize(neighborhoodName || "");
    const candidateNeighborhoods = [parsed.neighborhood, parsed.locality].filter(Boolean).map((n) => normalize(n!));
    const matchesNeighborhood = normalizedNeighborhood
      ? candidateNeighborhoods.some((n) => n.includes(normalizedNeighborhood))
      : true;
    const matchesProvince = normalize(parsed.administrativeArea ?? "").includes("cordoba");

    setNeighborhoodMatch(matchesNeighborhood);
    setProvinceMatch(matchesProvince);

    const shouldBlankStreet = source === "map" && !parsed.route;
    const shouldBlankNumber = source === "map" && !parsed.streetNumber;

    applyChange(
      {
        street: shouldBlankStreet ? "" : parsed.route || safeValue.street,
        number: shouldBlankNumber ? "" : parsed.streetNumber || safeValue.number,
        latitude: result.lat,
        longitude: result.lng,
      },
      source
    );

    const status = matchesNeighborhood && matchesProvince ? "success" : "warning";
    if (source === "manual") setForwardStatus(status);
    if (source === "map") setReverseStatus(status);
  };

  const scheduleForwardGeocode = () => {
    clearForwardTimer();
    if (!safeValue.street.trim() || !safeValue.number.trim()) return;
    const address = buildAddressString(safeValue, neighborhoodName);
    if (!address.trim()) return;

    setForwardStatus("waiting");
    forwardTimerRef.current = window.setTimeout(async () => {
      setForwardStatus("loading");
      try {
        const result = await geocodeForward({ placeId: internalPlaceId, address });
        updateFromGeocode(result, "manual");
      } catch (error) {
        console.error("Geocode error", error);
        setForwardStatus("error");
      } finally {
        sessionTokenRef.current = null;
      }
    }, GEOCODE_DELAY_MS);
  };

  const scheduleReverseGeocode = (coords: MapCoords) => {
    clearReverseTimer();
    setReverseStatus("waiting");
    reverseTimerRef.current = window.setTimeout(async () => {
      setReverseStatus("loading");
      try {
        const result = await reverseGeocode(coords.lat, coords.lng);
        updateFromGeocode(result, "map");
      } catch (error) {
        console.error("Reverse geocode error", error);
        setReverseStatus("error");
      }
    }, GEOCODE_DELAY_MS);
  };

  useEffect(() => {
    if (!neighborhoodId) {
      setNeighborhoodCenter(null);
      return;
    }
    setLoadingNeighborhood(true);

    getNeighborhoodById(neighborhoodId)
      .then((dto) => {
        if (dto?.latitude && dto?.longitude) {
          setNeighborhoodCenter({ lat: dto.latitude, lng: dto.longitude });
        } else {
          setNeighborhoodCenter(null);
        }
      })
      .catch((error) => {
        console.error("Neighborhood fetch error", error);
        setNeighborhoodCenter(null);
      })
      .finally(() => setLoadingNeighborhood(false));
  }, [neighborhoodId, neighborhoodName]);

  useEffect(() => {
    if (disabled) return;
    if (lastInteraction !== "manual") return;
    if (!safeValue.street || safeValue.street.trim().length < MIN_CHARS_FOR_AUTOCOMPLETE) {
      setSuggestions([]);
      return;
    }
    if (!neighborhoodCenter) return;

    const debounce = window.setTimeout(async () => {
      sessionTokenRef.current = sessionTokenRef.current ?? createToken();
      setAutocompleteLoading(true);
      const data = await fetchPlaceSuggestions(safeValue.street, {
        sessionToken: sessionTokenRef.current,
        bias: { center: neighborhoodCenter, radius: 1500 },
      });
      setSuggestions(data);
      setAutocompleteLoading(false);
    }, AUTOCOMPLETE_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(debounce);
    };
  }, [safeValue.street, lastInteraction, neighborhoodCenter, disabled]);

  useEffect(() => {
    if (disabled) return;
    if (lastInteraction !== "manual") return;
    if (!safeValue.street.trim() || !safeValue.number.trim()) {
      clearForwardTimer();
      return;
    }
    scheduleForwardGeocode();
    return () => clearForwardTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeValue.street, safeValue.number, internalPlaceId, neighborhoodName, lastInteraction, disabled]);

  useEffect(() => () => clearForwardTimer(), []);
  useEffect(() => () => clearReverseTimer(), []);

  useEffect(() => {
    if (!openMap || !neighborhoodCenter) return;
    let alive = true;
    setMapLoading(true);
    loadGoogleMapsSdk()
      .then((googleMaps) => {
        if (!alive || !mapNodeRef.current) return;

        // Determinar centro y zoom según si hay dirección validada
        const hasValidatedAddress = Boolean(safeValue.latitude && safeValue.longitude);
        const center = hasValidatedAddress
          ? { lat: safeValue.latitude!, lng: safeValue.longitude! }
          : neighborhoodCenter;
        const zoom = hasValidatedAddress ? 16 : 14; // Zoom más alejado para vista del barrio

        if (!mapInstanceRef.current) {
          mapInstanceRef.current = new googleMaps.maps.Map(mapNodeRef.current, {
            center,
            zoom,
            disableDefaultUI: true,
          });
        } else {
          mapInstanceRef.current.setCenter(center);
          mapInstanceRef.current.setZoom(zoom);
        }

        if (!markerRef.current) {
          markerRef.current = new googleMaps.maps.Marker({
            map: mapInstanceRef.current,
            position: center,
            visible: hasValidatedAddress,
          });
        } else {
          markerRef.current.setPosition(center);
          markerRef.current.setVisible(Boolean(hasValidatedAddress));
        }

        mapListenerRef.current?.remove?.();
        mapListenerRef.current = mapInstanceRef.current.addListener("click", (event: any) => {
          if (!event.latLng) return;
          const coords = event.latLng.toJSON();
          markerRef.current?.setPosition(coords);
          markerRef.current?.setVisible(true);
          setPendingCoords(coords);
          scheduleReverseGeocode(coords);
        });
      })
      .catch((error) => {
        console.error("Google Maps JS error", error);
      })
      .finally(() => setMapLoading(false));

    return () => {
      alive = false;
    };
  }, [openMap, neighborhoodCenter, safeValue.latitude, safeValue.longitude]);

  useEffect(() => () => mapListenerRef.current?.remove?.(), []);

  const statusAlert = (status: Status, label: string) => {
    if (status === "idle") return null;
    const severity: "success" | "info" | "warning" | "error" =
      status === "success" ? "success" : status === "warning" ? "warning" : status === "error" ? "error" : "info";

    const getSuccessMessage = () => {
      if (label === "Dirección") {
        return neighborhoodMatch && provinceMatch
          ? `Dirección validada y dentro de ${neighborhoodName}`
          : `Dirección validada`;
      }
      return label === "Ubicación seleccionada"
        ? neighborhoodMatch && provinceMatch
          ? `Ubicación validada y dentro de ${neighborhoodName}`
          : `Ubicación validada`
        : `${label} validada`;
    };

    const messageMap: Record<Status, string> = {
      idle: "",
      waiting: "Esperando para validar la dirección…",
      loading: "Validando con Google Maps…",
      success: getSuccessMessage(),
      warning: `Coordenadas obtenidas pero fuera del área esperada`,
      error: `No pudimos validar la dirección. Intenta nuevamente`,
    };
    return (
      <Alert severity={severity} iconMapping={{ warning: <ErrorIcon fontSize="small" /> }} sx={{ mt: 1 }}>
        {messageMap[status]}
      </Alert>
    );
  };

  return (
    <Card sx={{ p: 2 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
          columnGap: 1.5,
          rowGap: 1.5,
          alignItems: "center",
        }}
      >
        <Box sx={{ gridColumn: { xs: "span 12", md: "span 7" }, position: "relative" }}>
          <TextField
            ref={streetInputRef}
            label="Calle"
            value={safeValue.street}
            onChange={(e) => handleStreetChange(e.target.value)}
            onFocus={() => {
              setStreetFocused(true);
              sessionTokenRef.current = sessionTokenRef.current ?? createToken();
            }}
            onBlur={() => setStreetFocused(false)}
            fullWidth
            size="small"
            disabled={disabled || loadingNeighborhood}
            InputProps={{
              endAdornment: autocompleteLoading ? (
                <InputAdornment position="end">
                  <CircularProgress size={16} />
                </InputAdornment>
              ) : undefined,
            }}
          />
          <Popper
            open={showSuggestions}
            anchorEl={streetInputRef.current}
            placement="bottom-start"
            style={{ zIndex: 1500 }}
            modifiers={[
              {
                name: "offset",
                options: {
                  offset: [0, 4],
                },
              },
            ]}
          >
            <Paper
              elevation={3}
              sx={{
                width: streetInputRef.current?.offsetWidth || "auto",
                maxHeight: 220,
                overflowY: "auto",
              }}
            >
              {suggestions.map((item) => (
                <MenuItem
                  key={item.id}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSuggestionSelect(item)}
                >
                  <Stack spacing={0.3}>
                    <Typography variant="body2" fontWeight={600}>
                      {item.mainText}
                    </Typography>
                    {item.secondaryText && (
                      <Typography variant="caption" color="text.secondary">
                        {item.secondaryText}
                      </Typography>
                    )}
                  </Stack>
                </MenuItem>
              ))}
            </Paper>
          </Popper>
        </Box>

        <Box sx={{ gridColumn: { xs: "span 7", md: "span 3" } }}>
          <TextField
            label="Número"
            value={safeValue.number}
            onChange={(e) => handleNumberChange(e.target.value)}
            fullWidth
            size="small"
            disabled={disabled || loadingNeighborhood}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => handleNumberChange("S/N")}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box sx={{ gridColumn: { xs: "span 5", md: "span 2" } }}>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            startIcon={<MapIcon />}
            onClick={() => setOpenMap(true)}
            disabled={disabled || loadingNeighborhood}
          >
            Mapa
          </Button>
        </Box>
      </Box>

      {loadingNeighborhood && (
        <Stack direction="row" spacing={1} alignItems="center" mt={1}>
          <CircularProgress size={18} aria-label="Cargando datos del barrio" />
        </Stack>
      )}

      {statusAlert(forwardStatus, "Dirección")}

      <Dialog open={openMap} onClose={handleCloseMap} fullWidth maxWidth="md" keepMounted>
        <DialogTitle>Elegir punto en el mapa</DialogTitle>
        <DialogContent>
          {neighborhoodCenter ? (
            <Box sx={{ mt: 1, height: 400, borderRadius: 2, overflow: "hidden", position: "relative" }}>
              <Box ref={mapNodeRef} sx={{ width: "100%", height: "100%" }} />
              {mapLoading && (
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "rgba(255,255,255,0.7)",
                  }}
                >
                  <CircularProgress />
                </Box>
              )}
            </Box>
          ) : (
            <Alert severity="info" sx={{ mt: 2 }}>
              Seleccioná un barrio para habilitar el mapa.
            </Alert>
          )}

          {pendingCoords && (
            <Typography variant="body2" color="text.secondary" mt={2}>
              Punto seleccionado: {pendingCoords.lat.toFixed(6)}, {pendingCoords.lng.toFixed(6)}
            </Typography>
          )}

          {statusAlert(reverseStatus, "Ubicación seleccionada")}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMap}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};
