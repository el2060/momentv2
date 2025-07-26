import React from 'react';

interface RotationArrowProps {
  direction: 'cw' | 'ccw';
  className?: string;
}

const RotationArrow: React.FC<RotationArrowProps> = ({ direction, className = 'w-6 h-6' }) => {
  const path = direction === 'ccw'
    ? "M15.55 5.55L11 1v3.07A8.008 8.008 0 0012 20a8.008 8.008 0 007.28-4.72L17.23 14A6 6 0 1112 8.07V11l4.55-4.55z"
    : "M8.45 5.55L13 1v3.07A8.008 8.008 0 0112 20a8.008 8.008 0 01-7.28-4.72L6.77 14A6 6 0 1012 8.07V11L8.45 5.55z";

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d={path} />
    </svg>
  );
};

export default RotationArrow;
