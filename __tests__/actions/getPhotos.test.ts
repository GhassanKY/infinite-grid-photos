import { getPhotos } from '../../app/actions/getPhotos';
import api from '../../app/services/axios';
import { Photo } from '../../app/interface/photo.interface';

jest.mock('../../app/services/axios', () => ({
  get: jest.fn(),
}));

jest.mock('axios', () => ({
  isAxiosError: jest.fn()
}));

describe('getPhotos Action', () => {

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterAll(() => {
    (console.error as jest.Mock).mockRestore();
    (console.warn as jest.Mock).mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockPhoto: Photo = {
    id: "1",
    author: "John Doe",
    width: 5000,
    height: 3333,
    url: "https://unsplash.com/photos/1",
    download_url: "https://picsum.photos/id/1/5000/3333",
  };

  it('should fetch photos successfully', async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({ data: [mockPhoto] });

    const result = await getPhotos(1);

    expect(api.get).toHaveBeenCalledWith('/v2/list', {
      params: { page: 1, limit: 20 },
    });
    expect(result).toEqual([mockPhoto]);
  });

  it('should return [] if data schema is invalid (not an array)', async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({ data: "Not an array" });

    const result = await getPhotos(1);

    expect(api.get).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('should catch API errors, log them, and return []', async () => {
    const mockError = new Error('API Timeout');
    (api.get as jest.Mock).mockRejectedValueOnce(mockError);

    const result = await getPhotos(1);

    expect(console.error).toHaveBeenCalled();
    expect(result).toEqual([]);
  });
});
