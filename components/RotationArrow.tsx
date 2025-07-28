import React from 'react';

interface RotationArrowProps {
  direction: 'cw' | 'ccw';
  className?: string;
}

const RotationArrow: React.FC<RotationArrowProps> = ({ direction, className = 'w-6 h-6' }) => {
  if (direction === 'ccw') {
    // Counter-clockwise arrow (anti-clockwise) - positive moment
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className={className}>
        {/* Simple circular arc - counter-clockwise */}
        <path 
          d="M12 2 A10 10 0 1 1 3.5 8" 
          stroke="currentColor"
          strokeWidth="2.5" 
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    );
  } else {
    // Clockwise arrow - negative moment  
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className={className}>
        {/* Simple circular arc - clockwise */}
        <path 
          d="M12 2 A10 10 0 1 0 20.5 8" 
          stroke="currentColor"
          strokeWidth="2.5" 
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    );
  }
};

export default RotationArrow;
