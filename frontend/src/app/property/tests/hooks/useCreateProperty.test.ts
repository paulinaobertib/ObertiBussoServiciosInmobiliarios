import { renderHook, act } from '@testing-library/react';
import { useCreateProperty } from '../../hooks/useManagePropertyPage';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('useCreateProperty', () => {
  let file1: File;
  let file2: File;

  beforeEach(() => {
    file1 = new File(['dummy content'], 'image1.png', { type: 'image/png' });
    file2 = new File(['dummy content'], 'image2.png', { type: 'image/png' });
  });

  it('inicializa el estado correctamente', () => {
    const { result } = renderHook(() => useCreateProperty());

    expect(result.current.main).toBe(null);
    expect(result.current.gallery).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(typeof result.current.setMain).toBe('function');
    expect(typeof result.current.deleteImgFile).toBe('function');
  });

  it('establece las imágenes correctamente con handleImages', () => {
    const { result } = renderHook(() => useCreateProperty());

    act(() => {
      result.current.handleImages(file1, [file1, file2]);
    });

    expect(result.current.main).toBe(file1);
    expect(result.current.gallery).toEqual([file1, file2]);
  });

    it('elimina la imagen principal con deleteImgFile', () => {
    const { result } = renderHook(() => useCreateProperty());

    const deleteImageMock = vi.fn();
    result.current.formRef.current = { deleteImage: deleteImageMock };

    act(() => {
        result.current.handleImages(file1, [file1, file2]);
    });

    act(() => {
        result.current.deleteImgFile(file1);
    });

    expect(result.current.main).toBe(null);
    expect(result.current.gallery).toEqual([file1, file2]);
    expect(deleteImageMock).toHaveBeenCalledWith(file1);
    });

  it('elimina una imagen de la galería con deleteImgFile', () => {
    const { result } = renderHook(() => useCreateProperty());

    const deleteImageMock = vi.fn();
    result.current.formRef.current = { deleteImage: deleteImageMock };

    act(() => {
      result.current.handleImages(file1, [file1, file2]);
    });

    act(() => {
      result.current.deleteImgFile(file2);
    });

    expect(result.current.main).toBe(file1);
    expect(result.current.gallery).toEqual([file1]);
    expect(deleteImageMock).toHaveBeenCalledWith(file2);
  });

  it('resetea el estado con reset', () => {
    const { result } = renderHook(() => useCreateProperty());

    act(() => {
      result.current.handleImages(file1, [file1, file2]);
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.main).toBe(null);
    expect(result.current.gallery).toEqual([]);
  });

  it('permite cambiar el estado de loading', () => {
    const { result } = renderHook(() => useCreateProperty());

    act(() => {
      result.current.setLoading(true);
    });

    expect(result.current.loading).toBe(true);
  });
});
