import { renderHook, act } from '@testing-library/react';
import { useImageHandlers } from '../../../shared/hooks/useImages';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { emptyProperty, Property } from '../../types/property';

describe('useImageHandlers', () => {
  // Creamos una función que genera un Property válido,
  // usando emptyProperty como base, y solo cambiamos lo necesario
  const createEmptyForm = (): Property => ({
    ...emptyProperty,
    mainImage: "", // string vacío para "sin imagen"
    images: [],
  });

  const setFieldMock = vi.fn();
  const onImageSelectMock = vi.fn();

  beforeEach(() => {
    setFieldMock.mockReset();
    onImageSelectMock.mockReset();
  });

  it('handleMainImage con file null limpia mainImage y llama onImageSelect', () => {
    const { result } = renderHook(() => useImageHandlers());
    const form = createEmptyForm();

    act(() => {
      result.current.handleMainImage(null, form, setFieldMock, onImageSelectMock);
    });

    expect(setFieldMock).toHaveBeenCalledWith('mainImage', null);
    expect(onImageSelectMock).toHaveBeenCalledWith(null, form.images);
  });

  it('handleMainImage con file igual a mainImage setea error', () => {
    const { result } = renderHook(() => useImageHandlers());
    const file = new File(['content'], 'file.png');
    const form = { ...createEmptyForm(), mainImage: file, images: [] };

    act(() => {
      result.current.handleMainImage(file, form, setFieldMock);
    });

    expect(result.current.imageError).toBe('Esta imagen ya está como principal');
    expect(setFieldMock).not.toHaveBeenCalled();
  });

  it('handleMainImage remueve file duplicado de gallery y setea mainImage', () => {
    const { result } = renderHook(() => useImageHandlers());
    const file = new File(['content'], 'file.png');
    const otherFile = new File(['content'], 'other.png');
    const form = {
      ...createEmptyForm(),
      mainImage: "",
      images: [file, otherFile],
    };

    act(() => {
      result.current.handleMainImage(file, form, setFieldMock, onImageSelectMock);
    });

    expect(setFieldMock).toHaveBeenCalledWith('mainImage', file);
    expect(setFieldMock).toHaveBeenCalledWith('images', [otherFile]);
    expect(onImageSelectMock).toHaveBeenCalledWith(file, [otherFile]);
  });

  it('handleGalleryImages filtra duplicados y setea imágenes y error si hay duplicados', () => {
    const { result } = renderHook(() => useImageHandlers());
    const existingFile = new File([''], 'exist.png');
    const newFile = new File([''], 'new.png');
    const duplicateFile = new File([''], 'exist.png');
    const form = {
      ...createEmptyForm(),
      mainImage: "",
      images: [existingFile],
    };

    act(() => {
      result.current.handleGalleryImages(
        [newFile, duplicateFile],
        form,
        setFieldMock,
        onImageSelectMock
      );
    });

    expect(setFieldMock).toHaveBeenCalledWith('images', [existingFile, newFile]);
    expect(onImageSelectMock).toHaveBeenCalledWith("", [existingFile, newFile]);
    expect(result.current.imageError).toBe('Se ignoró 1 imagen; ya está en uso');
  });

  it('handleGalleryImages no añade imágenes si todos son duplicados', () => {
    const { result } = renderHook(() => useImageHandlers());
    const existingFile = new File([''], 'exist.png');
    const form = {
      ...createEmptyForm(),
      mainImage: "",
      images: [existingFile],
    };

    act(() => {
      result.current.handleGalleryImages(
        [existingFile],
        form,
        setFieldMock,
        onImageSelectMock
      );
    });

    expect(setFieldMock).not.toHaveBeenCalled();
    expect(onImageSelectMock).not.toHaveBeenCalled();
  });

  it('deleteImage elimina mainImage si es igual al file y llama onImageSelect', () => {
    const { result } = renderHook(() => useImageHandlers());
    const file = new File([''], 'main.png');
    const form = {
      ...createEmptyForm(),
      mainImage: file,
      images: [file],
    };

    act(() => {
      result.current.deleteImage(file, form, setFieldMock, onImageSelectMock);
    });

    expect(setFieldMock).toHaveBeenCalledWith('mainImage', null);
    expect(onImageSelectMock).toHaveBeenCalledWith(null, form.images);
  });

  it('deleteImage elimina file de gallery si no es mainImage y llama onImageSelect', () => {
    const { result } = renderHook(() => useImageHandlers());
    const mainFile = new File([''], 'main.png');
    const otherFile = new File([''], 'other.png');
    const form = {
      ...createEmptyForm(),
      mainImage: mainFile,
      images: [mainFile, otherFile],
    };

    act(() => {
      result.current.deleteImage(otherFile, form, setFieldMock, onImageSelectMock);
    });

    expect(setFieldMock).toHaveBeenCalledWith('images', [mainFile]);
    expect(onImageSelectMock).toHaveBeenCalledWith(mainFile, [mainFile]);
  });

  it('clearImageError resetea el error', () => {
    const { result } = renderHook(() => useImageHandlers());

    act(() => {
      // para provocar error, llamamos handleMainImage con file igual al mainImage
      const file = new File(['content'], 'file.png');
      const form = { ...createEmptyForm(), mainImage: file, images: [] };
      result.current.handleMainImage(file, form, setFieldMock);
    });

    expect(result.current.imageError).toBe('Esta imagen ya está como principal');

    act(() => {
      result.current.clearImageError();
    });

    expect(result.current.imageError).toBe(null);
  });
});
