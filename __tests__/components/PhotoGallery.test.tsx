import { render, screen } from '@testing-library/react';
import PhotoGallery from '../../app/components/PhotoGallery';
import { usePhotoGallery } from '../../app/hooks/usePhotoGallery';
import { Photo } from '../../app/interface/photo.interface';
import React, { ReactNode, ImgHTMLAttributes } from 'react';
import { ImageProps } from 'next/image';

jest.mock('../../app/hooks/usePhotoGallery', () => ({
    usePhotoGallery: jest.fn(),
}));

jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, initial, animate, exit, transition, layout, ...props }: any) =>
            <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

jest.mock('react-infinite-scroll-component', () => {
    return function MockInfiniteScroll({
        children,
        loader,
        endMessage,
        hasMore,
    }: {
        children: ReactNode;
        loader: ReactNode;
        endMessage: ReactNode;
        hasMore: boolean;
    }) {
        return (
            <div data-testid="infinite-scroll">
                {children}
                {hasMore ? loader : endMessage}
            </div>
        );
    };
});

jest.mock('next/image', () => {
    return function MockImage(props: ImageProps) {
        const imgProps = { ...props } as ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; unoptimized?: boolean };
        delete imgProps.fill;
        delete imgProps.unoptimized;
        return React.createElement('img', { ...imgProps, alt: props.alt || '' });
    };
});

describe('PhotoGallery Component', () => {

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

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render the gallery with the mocked photos', () => {
        (usePhotoGallery as jest.Mock).mockReturnValue({
            photos: mockInitialData,
            handleDelete: jest.fn(),
            loadMorePhotos: jest.fn(),
            hasMore: true,
            isFetching: false,
        });

        render(<PhotoGallery initialData={mockInitialData} />);

        expect(usePhotoGallery).toHaveBeenCalledWith({ initialData: mockInitialData });
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByTestId('infinite-scroll')).toBeInTheDocument();
    });

    it('should display the EndMessage when hasMore is false', () => {
        (usePhotoGallery as jest.Mock).mockReturnValue({
            photos: mockInitialData,
            handleDelete: jest.fn(),
            loadMorePhotos: jest.fn(),
            hasMore: false,
            isFetching: false,
        });

        render(<PhotoGallery initialData={mockInitialData} />);

        const endMessage = screen.getByText('You have reached the end of this gallery.');
        expect(endMessage).toBeInTheDocument();
    });
});
