import { Force, Distances, PivotPointId } from '../types';
import { getApplicationPoints } from '../constants';

const degreesToRadians = (degrees: number): number => degrees * (Math.PI / 180);

export const calculateSingleForceMoment = (
  force: Force,
  distances: Distances,
  pivotId: PivotPointId | null
): number => {
    if (!force.isEnabled || !pivotId) {
        return 0;
    }
    const points = getApplicationPoints(distances);
    const pivotPoint = points[pivotId];
    const applicationPoint = points[force.id];

    // Position vector r from pivot to point of application
    const rx = applicationPoint.x - pivotPoint.x;
    const ry = applicationPoint.y - pivotPoint.y;

    // Force vector components
    const angleRad = degreesToRadians(force.angle);
    const Fx = force.magnitude * Math.cos(angleRad);
    const Fy = force.magnitude * Math.sin(angleRad);
    
    // Moment = r x F = rx * Fy - ry * Fx
    const moment = rx * Fy - ry * Fx;
    return moment;
}

export const calculateTotalMoment = (
  forces: Record<PivotPointId, Force>,
  distances: Distances,
  pivotId: PivotPointId | null
): number => {
  if (!pivotId) {
    return 0;
  }
  let totalMoment = 0;
  for (const forceId in forces) {
    const force = forces[forceId as PivotPointId];
    totalMoment += calculateSingleForceMoment(force, distances, pivotId);
  }
  return totalMoment;
};
