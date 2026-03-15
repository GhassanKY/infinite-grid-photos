import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PhotoCard from '../../app/components/PhotoCard';
import { Photo } from '../../app/interface/photo.interface';
import React, { ImgHTMLAttributes } from 'react';
import { ImageProps } from 'next/image';

jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, initial, animate, exit, transition, layout, ...props }: any) =>
            <div {...props}>{children}</div>,
    },
}));

jest.mock('next/image', () => {
    return function MockImage(props: ImageProps) {
        const imgProps = { ...props } as ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; unoptimized?: boolean };
        delete imgProps.fill;
        delete imgProps.unoptimized;
        return React.createElement('img', { ...imgProps, alt: props.alt || '' });
    };
});

describe('PhotoCard Component', () => {
    const mockPhoto: Photo = {
        id: "101",
        author: "John Doe",
        width: 5000,
        height: 3333,
        url: "https://unsplash.com/photos/101",
        download_url: "https://picsum.photos/id/101/5000/3333",
    };

    const mockOnDelete = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render the correct author name', () => {
        render(<PhotoCard photo={mockPhoto} onDelete={mockOnDelete} />);

        const titleElement = screen.getByText("John Doe");
        expect(titleElement).toBeInTheDocument();
    });

    it('should pass down the onDelete callback to the SmartImage component', async () => {
        const user = userEvent.setup();

        render(<PhotoCard photo={mockPhoto} onDelete={mockOnDelete} />);

        const deleteButton = screen.getByRole('button', { name: `Eliminar imagen de ${mockPhoto.author}` });

        await user.click(deleteButton);

        expect(mockOnDelete).toHaveBeenCalledTimes(1);
        expect(mockOnDelete).toHaveBeenCalledWith("101");
    });
});
