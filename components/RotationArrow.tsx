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
        {/* Circular arc - counter-clockwise */}
        <path 
          d="M12 3 A8 8 0 1 1 5 10" 
          stroke="currentColor"
          strokeWidth="2.5" 
          fill="none"
          strokeLinecap="round"
        />
        {/* Triangular arrowhead pointing counter-clockwise */}
        <path 
          d="M5 10 L2 7 L7 6 Z" 
          fill="currentColor"
        />
      </svg>
    );
  } else {
    // Clockwise arrow - negative moment  
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className={className}>
        {/* Circular arc - clockwise */}
        <path 
          d="M12 3 A8 8 0 1 0 19 10" 
          stroke="currentColor"
          strokeWidth="2.5" 
          fill="none"
          strokeLinecap="round"
        />
        {/* Triangular arrowhead pointing clockwise */}
        <path 
          d="M19 10 L22 7 L17 6 Z" 
          fill="currentColor"
        />
      </svg>
    );
  }
};

export default RotationArrow;
