import { Force, Distances, PivotPointId } from '../types';
import { getApplicationPoints } from '../constants';

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

    // Use force components directly (more accurate than converting from magnitude/angle)
    const Fx = force.fx;
    const Fy = force.fy;
    
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
