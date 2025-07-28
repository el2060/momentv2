
import { AppState, Distances, Force, PivotPointId, Point, ConceptId } from './types';

export const INITIAL_FORCES: Record<PivotPointId, Force> = {
  A: { 
    id: 'A', 
    name: "Force F_A at A", 
    isEnabled: true, 
    magnitude: 50, 
    angle: 135, 
    useComponents: false, 
    fx: -35.36, 
    fy: 35.36,
    useAcuteAngle: true,  // Default to acute angle to avoid student confusion
    acuteAngle: 45,
    xDirection: 'left',
    yDirection: 'up'
  },
  B: { 
    id: 'B', 
    name: "Force F_C at B", 
    isEnabled: false, 
    magnitude: 60, 
    angle: 225, 
    useComponents: false, 
    fx: -42.43, 
    fy: -42.43,
    useAcuteAngle: true,  // Default to acute angle to avoid student confusion
    acuteAngle: 45,
    xDirection: 'left',
    yDirection: 'down'
  },
  C: { 
    id: 'C', 
    name: "Force F_B at C", 
    isEnabled: true, 
    magnitude: 75, 
    angle: 270, 
    useComponents: false, 
    fx: 0, 
    fy: -75,
    useAcuteAngle: true,  // Default to acute angle to avoid student confusion
    acuteAngle: 90,
    xDirection: 'right',
    yDirection: 'down'
  },
  D: { 
    id: 'D', 
    name: "Force F_D at D", 
    isEnabled: true, 
    magnitude: 40, 
    angle: 45, 
    useComponents: false, 
    fx: 28.28, 
    fy: 28.28,
    useAcuteAngle: true,  // Default to acute angle to avoid student confusion
    acuteAngle: 45,
    xDirection: 'right',
    yDirection: 'up'
  },
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
