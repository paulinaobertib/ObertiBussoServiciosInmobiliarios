import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSearchFilters } from '../../hooks/useSearchFilters';
import { getPropertiesByFilters } from '../../services/property.service';
import { Property } from '../../types/property';
import * as PropertiesContext from '../../context/PropertiesContext';

vi.mock('../../services/property.service', () => ({
  getPropertiesByFilters: vi.fn(),
}));

describe('useSearchFilters', () => {
  const mockBuildSearchParams = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();

    vi.spyOn(PropertiesContext, 'usePropertyCrud').mockReturnValue({
      buildSearchParams: mockBuildSearchParams,
      amenitiesList: [],
      ownersList: [],
      neighborhoodsList: [],
      typesList: [],
      createProperty: vi.fn(),
      updateProperty: vi.fn(),
      deleteProperty: vi.fn(),
      getProperties: vi.fn(),
      loading: false,
      properties: [],
      selectedProperty: null,
      setSelectedProperty: vi.fn(),
      getPropertyById: vi.fn(),
      createAmenity: vi.fn(),
      getAllAmenities: vi.fn(),
    } as unknown as ReturnType<typeof PropertiesContext.usePropertyCrud>);
  });

  it('should initialize with default params', () => {
    const { result } = renderHook(() => useSearchFilters());

    expect(result.current.params).toEqual({
      priceFrom: 0,
      priceTo: 0,
      areaFrom: 0,
      areaTo: 0,
      rooms: 0,
      operation: '',
      type: '',
      amenities: [],
      city: '',
      neighborhood: '',
      neighborhoodType: '',
    });
  });

  it('should update params using setParams', () => {
    const { result } = renderHook(() => useSearchFilters());

    act(() => {
      result.current.setParams((prev) => ({ ...prev, city: 'Rosario' }));
    });

    expect(result.current.params.city).toBe('Rosario');
  });

  it('should call buildSearchParams and getPropertiesByFilters on apply', async () => {
    const mockedSearchParams = { city: 'Rosario' };
    const mockedProperties: Property[] = [
      {
        id: 1,
        title: 'Casa',
        street: 'Calle 1',
        number: '123',
        description: '',
        status: '',
        operation: '',
        currency: '',
        rooms: 0,
        bathrooms: 0,
        bedrooms: 0,
        area: 100,
        coveredArea: 100,
        price: 100000,
        showPrice: true,
        credit: false,
        financing: false,
        owner: { id: 1, firstName: '', lastName: '', mail: '', phone: '' },
        neighborhood: { id: 1, name: '', city: '', type: '' },
        type: {
          id: 1,
          name: '',
          hasRooms: true,
          hasBathrooms: true,
          hasBedrooms: true,
          hasCoveredArea: true,
        },
        amenities: [],
        mainImage: '',
        images: [],
      },
    ];

    mockBuildSearchParams.mockReturnValue(mockedSearchParams);
    (getPropertiesByFilters as any).mockResolvedValue(mockedProperties);

    const { result } = renderHook(() => useSearchFilters());

    let response: Property[] = [];
    await act(async () => {
      response = await result.current.apply();
    });

    expect(mockBuildSearchParams).toHaveBeenCalledWith(result.current.params);
    expect(getPropertiesByFilters).toHaveBeenCalledWith(mockedSearchParams);
    expect(response).toEqual(mockedProperties);
  });
});
