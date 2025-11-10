const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const ensureKey = () => {
  if (!GOOGLE_MAPS_KEY) {
    throw new Error("Falta configurar VITE_GOOGLE_MAPS_API_KEY");
  }
  return GOOGLE_MAPS_KEY as string;
};

const PLACES_AUTOCOMPLETE_URL = "https://places.googleapis.com/v1/places:autocomplete";
const GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json";

export type PlaceSuggestion = {
  id: string;
  placeId: string;
  mainText: string;
  secondaryText?: string;
  fullText: string;
};

export type LocationBias = {
  center: { lat: number; lng: number };
  radius?: number;
};

const buildHeaders = (fieldMask?: string) => ({
  "Content-Type": "application/json",
  "X-Goog-Api-Key": ensureKey(),
  ...(fieldMask ? { "X-Goog-FieldMask": fieldMask } : {}),
});

export const fetchPlaceSuggestions = async (
  input: string,
  options: { sessionToken?: string; bias?: LocationBias }
): Promise<PlaceSuggestion[]> => {
  const trimmed = input.trim();
  if (!trimmed) return [];

  const body: Record<string, unknown> = {
    input: trimmed,
    languageCode: "es",
    includedPrimaryTypes: ["route"],
    includedRegionCodes: ["ar"],
  };

  if (options.sessionToken) body.sessionToken = options.sessionToken;
  if (options.bias) {
    body.locationBias = {
      circle: {
        center: { latitude: options.bias.center.lat, longitude: options.bias.center.lng },
        radius: options.bias.radius ?? 2000,
      },
    };
  }

  try {
    const response = await fetch(PLACES_AUTOCOMPLETE_URL, {
      method: "POST",
      headers: buildHeaders(
        "suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat"
      ),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error("Places autocomplete error", await response.text());
      return [];
    }

    const data = (await response.json()) as any;
    const suggestions = Array.isArray(data?.suggestions) ? data.suggestions : [];

    return suggestions
      .map((item: any) => item?.placePrediction)
      .filter(Boolean)
      .map((prediction: any) => {
        const mainText = prediction?.structuredFormat?.mainText?.text ?? prediction?.text?.text ?? "";
        const secondaryText = prediction?.structuredFormat?.secondaryText?.text ?? "";
        const fullText = prediction?.text?.text ?? [mainText, secondaryText].filter(Boolean).join(", ");
        return {
          id: prediction?.placeId ?? crypto.randomUUID(),
          placeId: prediction?.placeId ?? "",
          mainText,
          secondaryText,
          fullText,
        } as PlaceSuggestion;
      })
      .filter((s: PlaceSuggestion) => !!s.placeId && !!s.fullText);
  } catch (error) {
    console.error("Places autocomplete exception", error);
    return [];
  }
};

type AddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

export interface ParsedGeocodeResult {
  formattedAddress: string;
  placeId: string;
  lat: number;
  lng: number;
  components: Record<string, string>;
  types: string[];
}

const buildComponentMap = (components: AddressComponent[] = []) => {
  const map: Record<string, string> = {};
  components.forEach((component) => {
    component.types?.forEach((type) => {
      if (!map[type]) map[type] = component.long_name;
    });
  });
  return map;
};

const requestGeocode = async (params: URLSearchParams): Promise<ParsedGeocodeResult | null> => {
  params.set("key", ensureKey());
  
  const response = await fetch(`${GEOCODE_URL}?${params.toString()}`);
  if (!response.ok) {
    console.error("Geocode error", await response.text());
    return null;
  }
  const data = (await response.json()) as any;
  if (data.status !== "OK" || !Array.isArray(data.results) || !data.results.length) {
    return null;
  }
  const result = data.results[0];
  const geometry = result.geometry?.location;
  if (!geometry) return null;
  
  return {
    formattedAddress: result.formatted_address ?? "",
    placeId: result.place_id ?? "",
    lat: geometry.lat,
    lng: geometry.lng,
    components: buildComponentMap(result.address_components ?? []),
    types: Array.isArray(result.types) ? result.types : [],
  };
};

export const geocodeForward = async (payload: { placeId?: string; address?: string }) => {
  if (!payload.placeId && !payload.address) return null;
  const params = new URLSearchParams();
  if (payload.placeId) {
    params.set("place_id", payload.placeId);
    // No agregar otros parámetros si se usa place_id
  } else if (payload.address) {
    params.set("address", payload.address);
    params.set("region", "ar");
    params.set("components", "country:AR|administrative_area:Cordoba");
    params.set("result_type", "street_address|route");
  }
  return requestGeocode(params);
};

export const reverseGeocode = async (lat: number, lng: number) => {
  const params = new URLSearchParams();
  params.set("latlng", `${lat},${lng}`);
  params.set("result_type", "street_address|route");
  params.set("region", "ar");
  return requestGeocode(params);
};

export type ParsedAddressComponents = ReturnType<typeof parseAddressComponents>;

export const parseAddressComponents = (map: Record<string, string>) => {
  return {
    route: map.route ?? "",
    streetNumber: map.street_number ?? "",
    locality: map.locality ?? map.administrative_area_level_2 ?? "",
    neighborhood: map.neighborhood ?? map.sublocality ?? "",
    administrativeArea: map.administrative_area_level_1 ?? "",
    postalCode: map.postal_code ?? "",
  };
};
