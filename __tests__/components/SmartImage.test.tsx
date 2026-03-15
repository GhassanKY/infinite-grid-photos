import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SmartImage from '../../app/components/SmartImage';
import React, { ImgHTMLAttributes } from 'react';
import { ImageProps } from 'next/image';

jest.mock('next/image', () => {
    return function MockImage(props: ImageProps) {
        const imgProps = { ...props } as ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; unoptimized?: boolean };
        delete imgProps.fill;
        delete imgProps.unoptimized;

        return React.createElement('img', { ...imgProps, alt: props.alt || '' });
    };
});

describe('SmartImage Component', () => {
    const defaultProps = {
        id: "1",
        src: "https://via.placeholder.com/300",
        alt: "Test image",
        width: 300,
        height: 300,
        onDelete: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should initially render the loading Skeleton', () => {
        const { container } = render(<SmartImage {...defaultProps} />);

        const skeleton = container.querySelector('.skeleton');
        expect(skeleton).toBeInTheDocument();
        expect(skeleton).toHaveClass('animate-pulse');
        expect(skeleton).toHaveClass('opacity-100');

        const img = screen.getByAltText("Test image");
        expect(img).toHaveClass("opacity-0");
    });

    it('should hide the Skeleton and show the image when onLoad triggers', () => {
        const { container } = render(<SmartImage {...defaultProps} />);

        const img = screen.getByAltText("Test image");

        fireEvent.load(img);

        const skeleton = container.querySelector('.skeleton');
        expect(skeleton).not.toHaveClass('animate-pulse');
        expect(skeleton).toHaveClass('opacity-0');

        expect(img).toHaveClass("opacity-100");
    });

    it('should preserve rounded corners and sizing classes on the image element', () => {
        render(<SmartImage {...defaultProps} className="w-full h-full" />);

        const img = screen.getByAltText("Test image");

        expect(img).toHaveClass('rounded-xl');
        expect(img).toHaveClass('w-full');
        expect(img).toHaveClass('h-full');
    });

    it('should fallback to default image if onError triggers', () => {
        const customFallback = "https://fallback.com/error.png";
        render(<SmartImage {...defaultProps} fallbackSrc={customFallback} />);
        
        const img = screen.getByAltText("Test image") as HTMLImageElement;

        fireEvent.error(img);

        expect(img.src).toContain("https://fallback.com/error.png");
        expect(img).toHaveClass("opacity-100");
    });

    it('should call onDelete when the delete override button is clicked', async () => {
        const user = userEvent.setup();
        render(<SmartImage {...defaultProps} />);
        
        const wrapper = screen.getByRole('button', { name: `Eliminar imagen de ${defaultProps.alt}`});
        
        await user.click(wrapper);
        
        expect(defaultProps.onDelete).toHaveBeenCalledTimes(1);
    });

    it('should call onDelete when Enter is pressed on the image wrapper', async () => {
        const user = userEvent.setup();
        render(<SmartImage {...defaultProps} />);

        const wrapper = screen.getByRole('button', { name: `Eliminar imagen de ${defaultProps.alt}`});
        wrapper.focus();
        await user.keyboard('{Enter}');

        expect(defaultProps.onDelete).toHaveBeenCalledTimes(1);
    });

    it('should expose a visible focus style for keyboard navigation', () => {
        render(<SmartImage {...defaultProps} />);

        const wrapper = screen.getByRole('button', { name: `Eliminar imagen de ${defaultProps.alt}`});

        expect(wrapper).toHaveClass('focus-visible:ring-4');
        expect(wrapper).toHaveClass('focus-visible:ring-inset');
        expect(wrapper).toHaveClass('focus-visible:ring-gray-500/70');
    });
});
