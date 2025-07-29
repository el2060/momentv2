
import React from 'react';
import { Force, PivotPointId, Distances } from '../types';
import { calculateSingleForceMoment } from '../services/momentCalculator';
import RotationArrow from './RotationArrow';

interface RotationVisualizationProps {
  forces: Record<PivotPointId, Force>;
  distances: Distances;
  pivotPoint: PivotPointId | null;
}

const RotationVisualization: React.FC<RotationVisualizationProps> = ({ forces, distances, pivotPoint }) => {
  if (!pivotPoint) {
    return <div className="text-gray-500 text-center font-mono">Select a pivot point to visualize rotation</div>;
  }

  const totalMoment = Object.values(forces)
    .filter(f => f.isEnabled)
    .reduce((sum, f) => sum + calculateSingleForceMoment(f, distances, pivotPoint), 0);


  const isCCW = totalMoment > 0.01;
  const isCW = totalMoment < -0.01;

  // Calculate angle for rotation visualization (example: proportional to moment, clamp to [-90, 90])
  // You can adjust this logic to fit your needs
  let angle = 0;
  if (isCCW) {
    angle = Math.max(-90, Math.min(90, totalMoment));
  } else if (isCW) {
    angle = Math.max(-90, Math.min(90, totalMoment));
  }

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="mb-4 text-lg font-bold text-gray-700 font-mono">Rotation Visualization</div>
      <div style={{ width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <RotationArrow
          direction={isCCW ? 'ccw' : isCW ? 'cw' : 'ccw'}
          angle={angle}
          className="w-[90px] h-[90px]"
        />
      </div>
      <div className={`mt-4 text-xl font-bold font-mono ${isCCW ? 'text-green-600' : isCW ? 'text-red-600' : 'text-gray-500'}`}>
        {isCCW && '+ve (Counter-clockwise)'}
        {isCW && '-ve (Clockwise)'}
        {!isCCW && !isCW && 'In Equilibrium'}
      </div>
      <div className="mt-2 text-base text-gray-700 font-mono">Moment: {totalMoment.toFixed(2)} Nm</div>
    </div>
  );
};

export default RotationVisualization;
