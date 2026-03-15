'use client'
import InfiniteScroll from 'react-infinite-scroll-component';
import { AnimatePresence } from 'framer-motion';
import { usePhotoGallery } from '../hooks/usePhotoGallery';
import PhotoCard from './PhotoCard';
import { EndMessage } from './EndMessage';
import { LoadingFallback } from './LoadingFallback';
import { Photo } from '../interface/photo.interface';

interface PhotoGalleryProps {
  initialData: Photo[]
}

export default function PhotoGallery({ initialData }: PhotoGalleryProps) {
  const { photos, handleDelete, loadMorePhotos, hasMore } = usePhotoGallery({ initialData });

  return (
    <InfiniteScroll
      dataLength={photos.length}
      next={loadMorePhotos}
      hasMore={hasMore}
      loader={<LoadingFallback />}
      endMessage={<EndMessage />}
      style={{ overflow: 'visible' }}
      scrollThreshold={0.8}
    >
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-6">
        <AnimatePresence>
          {photos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              onDelete={handleDelete}
            />
          ))}
        </AnimatePresence>
      </div>
    </InfiniteScroll>
  );
}
