
import { AppState, Distances, Force, PivotPointId, Point, ConceptId } from './types';

export const INITIAL_FORCES: Record<PivotPointId, Force> = {
  A: { id: 'A', name: "Force F_A at A", isEnabled: true, magnitude: 50, angle: 135 },
  B: { id: 'B', name: "Force F_C at B", isEnabled: false, magnitude: 60, angle: 225 },
  C: { id: 'C', name: "Force F_B at C", isEnabled: true, magnitude: 75, angle: 270 },
  D: { id: 'D', name: "Force F_D at D", isEnabled: true, magnitude: 40, angle: 45 },
};

export const INITIAL_DISTANCES: Distances = {
  d1: 3,
  d2: 4,
  d3: 5,
};

export const INITIAL_PIVOT_POINT: PivotPointId | null = null;

export const INITIAL_STATE: AppState = {
  pivotPoint: INITIAL_PIVOT_POINT,
  forces: INITIAL_FORCES,
  distances: INITIAL_DISTANCES,
};

export const SVG_VIEWBOX_WIDTH = 600;
export const SVG_VIEWBOX_HEIGHT = 500;
export const SVG_PADDING = 50;

export const getApplicationPoints = (distances: Distances): Record<PivotPointId, Point> => ({
    A: { x: 0, y: distances.d2 },
    B: { x: 0, y: 0 },
    C: { x: distances.d1, y: distances.d2 },
    D: { x: distances.d3, y: 0 },
});

export const CONCEPTS: { id: ConceptId, name: string }[] = [
    { id: 'moment', name: 'What is a Moment?' },
    { id: 'lever-arm', name: 'What is the Lever Arm?' },
    { id: 'equilibrium', name: 'What is Equilibrium?' },
];
