import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { usePropertyForm } from '../../hooks/usePropertyForm';
import { emptyProperty } from '../../types/property';

describe('usePropertyForm', () => {
  it('should initialize with empty property and no errors', () => {
    const { result } = renderHook(() => usePropertyForm());

    expect(result.current.form).toEqual(emptyProperty);
    expect(result.current.fieldErrors).toEqual({});
    expect(result.current.check).toBe(false);
  });

  it('should set a field correctly', () => {
    const { result } = renderHook(() => usePropertyForm());

    act(() => {
      result.current.setField('title', 'Casa en venta');
    });

    expect(result.current.form.title).toBe('Casa en venta');
  });

  it('should reset form and errors', () => {
    const { result } = renderHook(() => usePropertyForm());

    act(() => {
      result.current.setField('title', 'Casa');
      result.current.reset();
    });

    expect(result.current.form).toEqual(emptyProperty);
    expect(result.current.fieldErrors).toEqual({});
  });

  it('should validate and set fieldErrors when invalid', async () => {
    const { result } = renderHook(() => usePropertyForm());

    await act(async () => {
      await result.current.submit();
    });

    expect(Object.keys(result.current.fieldErrors).length).toBeGreaterThan(0);
    expect(result.current.check).toBe(false);
  });

  it('should validate and pass when form is filled', async () => {
    const { result } = renderHook(() => usePropertyForm());

    act(() => {
      result.current.setField('title', 'Propiedad');
      result.current.setField('street', 'Calle Falsa');
      result.current.setField('number', '123');
      result.current.setField('area', 100);
      result.current.setField('price', 100000);
      result.current.setField('description', 'Descripción');
      result.current.setField('status', 'Disponible');
      result.current.setField('operation', 'Venta');
      result.current.setField('currency', 'USD');
      result.current.setField('mainImage', 'imagen.jpg');
      result.current.setField('owner', { id: 1, firstName: '', lastName: '', mail: '', phone: '' });
      result.current.setField('neighborhood', { id: 1, name: '', city: '', type: '' });
      result.current.setField('type', {
        id: 1,
        name: '',
        hasRooms: true,
        hasBathrooms: true,
        hasBedrooms: true,
        hasCoveredArea: true, 
      });
    });

    let valid: boolean = false;
    await act(async () => {
      valid = await result.current.submit();
    });

    expect(valid).toBe(true);
    expect(result.current.fieldErrors).toEqual({});
    expect(result.current.check).toBe(true);
  });

  it('should return correct create data', () => {
    const { result } = renderHook(() => usePropertyForm());

    act(() => {
      result.current.setField('title', 'Propiedad');
      result.current.setField('owner', { id: 5, firstName: '', lastName: '', mail: '', phone: '' });
      result.current.setField('neighborhood', { id: 2, name: '', city: '', type: '' });
      result.current.setField('type', {
        id: 3,
        name: '',
        hasRooms: true,
        hasBathrooms: true,
        hasBedrooms: true,
        hasCoveredArea: true,
      });
      result.current.setField('amenities', [{ id: 1, name: 'Pileta' }, { id: 2, name: 'Jardín' }]);
    });

    const data = result.current.getCreateData();

    expect(data.ownerId).toBe(5);
    expect(data.neighborhoodId).toBe(2);
    expect(data.typeId).toBe(3);
    expect(data.amenitiesIds).toEqual([1, 2]);
  });

  it('should return correct update data', () => {
    const { result } = renderHook(() => usePropertyForm());

    act(() => {
      result.current.setField('id', 99);
      result.current.setField('title', 'Editado');
      result.current.setField('owner', { id: 9, firstName: '', lastName: '', mail: '', phone: '' });
      result.current.setField('neighborhood', { id: 7, name: '', city: '', type: '' });
      result.current.setField('type', {
        id: 2,
        name: '',
        hasRooms: true,
        hasBathrooms: true,
        hasBedrooms: true,
        hasCoveredArea: true,
      });
      result.current.setField('amenities', [{ id: 1, name: 'Pileta' }]);
    });

    const data = result.current.getUpdateData();

    expect(data.id).toBe(99);
    expect(data.ownerId).toBe(9);
    expect(data.neighborhoodId).toBe(7);
    expect(data.typeId).toBe(2);
    expect(data.amenitiesIds).toEqual([1]);
  });
});
