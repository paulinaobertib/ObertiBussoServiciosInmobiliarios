import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getImagesByPropertyId, postImage, deleteImageById } from '../../../components/images/image.service';
import { api } from '../../../../../api';

vi.mock('../../../../../api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('imageService', () => {
  const mockedApi = api as unknown as {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getImagesByPropertyId', () => {
    it('devuelve un array si la respuesta es válida', async () => {
      const mockData = [{ id: 1, url: 'image.jpg' }];
      mockedApi.get.mockResolvedValue({ data: mockData });

      const result = await getImagesByPropertyId(123);
      expect(mockedApi.get).toHaveBeenCalledWith(
        '/properties/image/getByProperty/123',
        { withCredentials: true }
      );
      expect(result).toEqual(mockData);
    });

    it('devuelve un array vacío si la respuesta no es un array', async () => {
      mockedApi.get.mockResolvedValue({ data: {} });

      const result = await getImagesByPropertyId(123);
      expect(result).toEqual([]);
    });
  });

  describe('postImage', () => {
    it('devuelve la URL si la carga es exitosa', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      mockedApi.post.mockResolvedValue({ data: 'https://url.com/image.jpg' });

      const url = await postImage(file, 456);

      expect(mockedApi.post).toHaveBeenCalledWith(
        '/properties/image/upload',
        expect.any(FormData),
        expect.objectContaining({
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        })
      );
      expect(url).toBe('https://url.com/image.jpg');
    });

    it('lanza un error si la carga falla', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      mockedApi.post.mockRejectedValue(new Error('Upload failed'));

      await expect(postImage(file, 456)).rejects.toThrow('Upload failed');
    });
  });

  describe('deleteImageById', () => {
    it('llama a la API con el ID correcto', async () => {
      mockedApi.delete.mockResolvedValue({});

      await deleteImageById(789);

      expect(mockedApi.delete).toHaveBeenCalledWith(
        '/properties/image/delete/789',
        { withCredentials: true }
      );
    });
  });
});
