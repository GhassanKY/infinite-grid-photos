import { useRef, useState, useEffect } from "react"
import { getPhotos } from "../actions/getPhotos"
import { APP_CONFIG, TIME } from "../constants/api"
import { Photo } from "../interface/photo.interface";

export const usePhotoGallery = ({ initialData }: { initialData: Photo[] }) => {
    const [photos, setPhotos] = useState<Photo[]>(initialData);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isFetching, setIsFetching] = useState(false);

    const requestDelayRef = useRef<number>(TIME.MIN_REQUEST_DELAY_MS);
    const isFetchingRef = useRef(false);

    const handleDelete = (id: string) => {
        setPhotos((current) => current.filter((photo) => photo.id !== id));
    };

    const loadMorePhotos = async () => {
        if (isFetchingRef.current || !hasMore) return;
        isFetchingRef.current = true;
        setIsFetching(true);

        if (requestDelayRef.current > 0) {
            await new Promise(res => setTimeout(res, requestDelayRef.current));
        }
        requestDelayRef.current = Math.min(requestDelayRef.current + TIME.INCREMENT_MS, TIME.MAX_REQUEST_DELAY_MS);

        try {
            const nextPage = page + 1;
            const newPhotos = await getPhotos(nextPage);
            const unique = newPhotos.filter(p => !photos.some(existing => existing.id === p.id));

            if (unique.length) {
                setPhotos(prev => [...prev, ...unique]);
                setPage(nextPage);
            }

            setHasMore(newPhotos.length === APP_CONFIG.DEFAULT_PAGE_SIZE);
            requestDelayRef.current = TIME.MIN_REQUEST_DELAY_MS;

        } catch (error) {
            console.error("[Hook Error]: Failed to load more photos", error);
        } finally {
            isFetchingRef.current = false;
            setIsFetching(false);
        }
    };

    useEffect(() => {
        if (initialData.length < APP_CONFIG.MIN_ITEMS_THRESHOLD) {
            loadMorePhotos();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        photos,
        handleDelete,
        loadMorePhotos,
        hasMore,
        isFetching
    };
};
