'use client';

import Image, { ImageProps } from 'next/image';
import Skeleton from './Skeleton';
import { useState } from 'react';

interface SmartImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  skeletonClassName?: string;
  fallbackSrc?: string;
  onDelete?: () => void;
}

const SmartImage = ({
  src,
  alt,
  skeletonClassName = '',
  fallbackSrc = 'https://dummyimage.com/226x226/cccccc/ffffff.png&text=Foto+no+disponible',
  onDelete,
  className,
  ...props
}: SmartImageProps) => {

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <button
      type="button"
      onClick={onDelete}
      className="group relative block aspect-square w-full overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-gray-500/70"
      aria-label={`Eliminar imagen de ${alt}`}
    >
      <Skeleton
        animate={isLoading}
        className={`absolute inset-0 z-10 bg-gray-200 dark:bg-gray-800 transition-opacity duration-500 ${isLoading ? 'opacity-100' : 'opacity-0'
          } ${skeletonClassName}`}
      />

      <Image
        {...props}
        src={hasError ? fallbackSrc : src}
        alt={alt}
        onLoad={() => setIsLoading(false)}
        onError={() => { setHasError(true); setIsLoading(false); }}
        className={`block h-full w-full rounded-xl object-cover transition-[opacity,filter,transform] duration-500 ease-out ${className ?? ''
          } ${isLoading ? 'opacity-0 blur-sm scale-[1.02]' : 'opacity-100 blur-0 scale-100'}`}
      />

      <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300
        group-hover:opacity-100
        group-focus-visible:opacity-100 cursor-pointer">
        <span className="text-white text-xs font-bold uppercase tracking-widest">
          Delete
        </span>
      </div>
    </button>
  );
};

export default SmartImage;
