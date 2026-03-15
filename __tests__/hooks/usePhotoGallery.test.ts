import { renderHook, act, waitFor } from '@testing-library/react';
import { usePhotoGallery } from '../../app/hooks/usePhotoGallery';
import { getPhotos } from '../../app/actions/getPhotos';
import { Photo } from '../../app/interface/photo.interface';
import { APP_CONFIG } from '../../app/constants/api';

jest.mock('../../app/actions/getPhotos', () => ({
  getPhotos: jest.fn(),
}));

jest.mock('../../app/constants/api', () => ({
  ...jest.requireActual('../../app/constants/api'),
  TIME: { SECONDS_TO_MS: 1000, INCREMENT_MS: 0, MIN_REQUEST_DELAY_MS: 0, MAX_REQUEST_DELAY_MS: 0 },
}));

const createMockPhoto = (id: string, author: string): Photo => ({
    id,
    author,
    width: 5000,
    height: 3333,
    url: `https://unsplash.com/photos/${id}`,
    download_url: `https://picsum.photos/id/${id}/5000/3333`,
});

const mockInitialData: Photo[] = [
    createMockPhoto('1', 'John Doe'),
    createMockPhoto('2', 'Jane Smith'),
];

describe('usePhotoGallery Hook', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    (console.error as jest.Mock).mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with provided initialData', () => {
    const { result } = renderHook(() => usePhotoGallery({ initialData: mockInitialData }));

    expect(result.current.photos).toEqual(mockInitialData);
    expect(result.current.hasMore).toBe(true);
  });

  it('should remove a photo correctly by id', () => {
    const { result } = renderHook(() => usePhotoGallery({ initialData: mockInitialData }));

    act(() => {
      result.current.handleDelete('1');
    });

    expect(result.current.photos).toHaveLength(1);
    expect(result.current.photos[0].id).toBe('2');
  });

  it(`should trigger loadMorePhotos automatically if initial photos are less than ${APP_CONFIG.MIN_ITEMS_THRESHOLD}`, async () => {
    const extraPhotos: Photo[] = [createMockPhoto('3', 'Bob Brown')];
    (getPhotos as jest.Mock).mockResolvedValue(extraPhotos);

    const { result } = renderHook(() => usePhotoGallery({ initialData: mockInitialData }));

    await waitFor(() => {
      expect(result.current.isFetching).toBe(false);
      expect(getPhotos).toHaveBeenCalledWith(2);
    });
  });

  it('should fetch the next page correctly on successful call', async () => {
    const batch1: Photo[] = Array.from({ length: APP_CONFIG.DEFAULT_PAGE_SIZE }, (_, i) =>
      createMockPhoto(String(100 + i), `Author ${i}`)
    );
    const batch2: Photo[] = [createMockPhoto('200', 'Author 200')];

    (getPhotos as jest.Mock)
      .mockResolvedValueOnce(batch1)
      .mockResolvedValueOnce(batch2);

    const initialData = Array(APP_CONFIG.MIN_ITEMS_THRESHOLD + 1).fill(null).map((_, i) => createMockPhoto(String(i + 1), `Char ${i}`));
    const { result } = renderHook(() => usePhotoGallery({ initialData }));

    await act(async () => {
      await result.current.loadMorePhotos();
    });
    expect(getPhotos).toHaveBeenCalledWith(2);

    await act(async () => {
      await result.current.loadMorePhotos();
    });
    expect(getPhotos).toHaveBeenCalledWith(3);
  });

  it('should set hasMore to false when API returns an empty array', async () => {
    (getPhotos as jest.Mock).mockResolvedValue([]);

    // Initial data < threshold triggers a fetch
    const { result } = renderHook(() => usePhotoGallery({ initialData: mockInitialData }));

    await waitFor(() => {
      expect(result.current.hasMore).toBe(false);
    });

    jest.clearAllMocks();

    await act(async () => {
      await result.current.loadMorePhotos();
    });
    expect(getPhotos).not.toHaveBeenCalled();
  });

  it('should prevent race conditions by ignoring duplicate calls while fetching', async () => {
    let resolveApi: (value: unknown) => void = () => {};
    (getPhotos as jest.Mock).mockReturnValue(new Promise((resolve) => { resolveApi = resolve; }));

    const initialData = Array(APP_CONFIG.MIN_ITEMS_THRESHOLD + 1).fill(null).map((_, i) => createMockPhoto(String(i + 1), `Char ${i}`));
    const { result } = renderHook(() => usePhotoGallery({ initialData }));

    await act(async () => {
      const p1 = result.current.loadMorePhotos();
      const p2 = result.current.loadMorePhotos();
      const mockResponse: Photo[] = [createMockPhoto('99', 'New Photo')];
      resolveApi(mockResponse);
      await Promise.all([p1, p2]);
    });

    expect(getPhotos).toHaveBeenCalledTimes(1);
  });

  it('should handle API errors gracefully and reset isFetching state', async () => {
    (getPhotos as jest.Mock).mockRejectedValue(new Error('500 Internal Server Error'));

    const initialData = Array(APP_CONFIG.MIN_ITEMS_THRESHOLD + 1).fill(null).map((_, i) => createMockPhoto(String(i + 1), `Char ${i}`));
    const { result } = renderHook(() => usePhotoGallery({ initialData }));

    expect(result.current.isFetching).toBe(false);

    await act(async () => {
      await result.current.loadMorePhotos();
    });

    expect(result.current.isFetching).toBe(false);
    expect(console.error).toHaveBeenCalled();
  });

  it('should toggle isFetching to true during API call and false when complete', async () => {
    let resolveApi: (value: unknown) => void = () => {};
    const promise = new Promise((resolve) => { resolveApi = resolve; });
    (getPhotos as jest.Mock).mockReturnValue(promise);

    const initialData = Array(APP_CONFIG.MIN_ITEMS_THRESHOLD + 1).fill(null).map((_, i) => createMockPhoto(String(i + 1), `Char ${i}`));
    const { result } = renderHook(() => usePhotoGallery({ initialData }));

    expect(result.current.isFetching).toBe(false);

    let loadPromise: Promise<void> | undefined;

    act(() => {
      loadPromise = result.current.loadMorePhotos();
    });

    expect(result.current.isFetching).toBe(true);

    await act(async () => {
      const mockResponse: Photo[] = [createMockPhoto('99', 'New Photo')];
      resolveApi(mockResponse);
      await loadPromise;
    });

    expect(result.current.isFetching).toBe(false);
  });

  it(`should not automatically fetch if initial data has exactly or more than ${APP_CONFIG.MIN_ITEMS_THRESHOLD} photos`, async () => {
    const initialData = Array(APP_CONFIG.MIN_ITEMS_THRESHOLD).fill(null).map((_, i) => createMockPhoto(String(i + 1), `Char ${i}`));
    renderHook(() => usePhotoGallery({ initialData }));

    await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(getPhotos).not.toHaveBeenCalled();
  });
});
