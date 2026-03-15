interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  animate?: boolean;
}

const Skeleton = ({ className = '', width, height, animate = true }: SkeletonProps) => {
  return (
    <div
      className={`skeleton ${animate ? 'animate-pulse' : ''} ${className}`}
      style={{ width, height }}
    />
  );
};

export default Skeleton;
