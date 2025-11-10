import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";

import { AddressSelector, AddressSelectorProps } from "../../../../components/propertyDetails/maps/AddressSelector";

const onChangeMock = vi.fn();

vi.mock("../../../../services/neighborhood.service", () => ({
  getNeighborhoodById: vi.fn().mockResolvedValue({ latitude: -31.4, longitude: -64.2 }),
}));

const geocodeResponse = {
  formattedAddress: "Av. Siempreviva 742, Córdoba",
  placeId: "place-123",
  lat: -31.401,
  lng: -64.228,
  components: {
    route: "Av. Siempreviva",
    street_number: "742",
    locality: "Córdoba",
    administrative_area_level_1: "Córdoba",
    postal_code: "5000",
  },
  types: ["street_address"],
};

const mockFetchSuggestions = vi.fn().mockResolvedValue([]);
const mockGeocodeForward = vi.fn().mockResolvedValue(geocodeResponse);

vi.mock("../../../../services/googleMaps.service", () => ({
  fetchPlaceSuggestions: (...args: any[]) => mockFetchSuggestions(...args),
  geocodeForward: (...args: any[]) => mockGeocodeForward(...args),
  reverseGeocode: vi.fn(),
  parseAddressComponents: (map: Record<string, string>) => ({
    route: map.route,
    streetNumber: map.street_number,
    locality: map.locality,
    neighborhood: map.neighborhood,
    administrativeArea: map.administrative_area_level_1,
    postalCode: map.postal_code,
  }),
}));

vi.mock("../../../../utils/googleMapsLoader", () => ({
  loadGoogleMapsSdk: vi.fn().mockRejectedValue(new Error("not needed in tests")),
}));

const Wrapper = (props: AddressSelectorProps) => {
  const [value, setValue] = useState(props.value);
  return (
    <AddressSelector
      {...props}
      value={value}
      onChange={(next) => {
        setValue(next);
        props.onChange(next);
      }}
    />
  );
};

describe("AddressSelector", () => {
  const baseProps: AddressSelectorProps = {
    neighborhoodId: 1,
    neighborhoodName: "Nueva Córdoba",
    value: {
      street: "",
      number: "",
      formattedAddress: "",
      latitude: null,
      longitude: null,
    },
    onChange: onChangeMock,
  };

  beforeEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("renderiza inputs y propaga cambios manuales", async () => {
    render(<Wrapper {...baseProps} />);

    const street = await screen.findByLabelText(/Calle/i);
    const number = await screen.findByLabelText(/Número/i);

    fireEvent.change(street, { target: { value: "Obispo Salguero" } });
    fireEvent.change(number, { target: { value: "1200" } });

    expect(onChangeMock).toHaveBeenCalledWith(expect.objectContaining({ street: "Obispo Salguero" }));
    expect(onChangeMock).toHaveBeenCalledWith(expect.objectContaining({ number: "1200" }));
  });

  it("programa geocode y actualiza coordenadas luego del debounce", async () => {
    render(<Wrapper {...baseProps} />);

    const street = await screen.findByLabelText(/Calle/i);
    const number = await screen.findByLabelText(/Número/i);

    vi.useFakeTimers();

    await act(async () => {
      fireEvent.change(street, { target: { value: "Av. Siempreviva" } });
      fireEvent.change(number, { target: { value: "742" } });
      await vi.advanceTimersByTimeAsync(5000);
    });

    expect(mockGeocodeForward).toHaveBeenCalled();
    expect(onChangeMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        street: "Av. Siempreviva",
        number: "742",
        latitude: geocodeResponse.lat,
        longitude: geocodeResponse.lng,
        formattedAddress: geocodeResponse.formattedAddress,
      })
    );

    vi.useRealTimers();
  });

  it("permite configurar número sin especificar", async () => {
    render(<Wrapper {...baseProps} />);

    const number = await screen.findByLabelText(/Número/i);
    const clearButton = number.closest("div")?.querySelector("button");
    expect(clearButton).toBeTruthy();
    fireEvent.click(clearButton!);

    expect(onChangeMock).toHaveBeenCalledWith(expect.objectContaining({ number: "S/N" }));
  });
});
