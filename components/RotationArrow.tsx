import React from 'react';

interface RotationArrowProps {
  direction: 'cw' | 'ccw';
  angle?: number; // degrees
  className?: string;
}

const RotationArrow: React.FC<RotationArrowProps> = ({ direction, angle = 0, className = 'w-6 h-6' }) => {
  // Always render a straight line, no curve, no arrowhead
  // ccw: bottom left to top right, cw: top right to bottom left
  const ccw = { x1: 6, y1: 18, x2: 18, y2: 6 };
  const cw = { x1: 18, y1: 6, x2: 6, y2: 18 };
  const line = direction === 'ccw' ? ccw : cw;

  // Center of rotation for transform
  const centerX = 12;
  const centerY = 12;

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className={className}>
      <g transform={`rotate(${angle},${centerX},${centerY})`}>
        <line
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke="#8B5CF6"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
};

export default RotationArrow;
