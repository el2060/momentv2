

export type PivotPointId = 'A' | 'B' | 'C' | 'D';

export interface Point {
  x: number;
  y: number;
}

export interface Force {
  id: PivotPointId;
  name: string;
  isEnabled: boolean;
  magnitude: number; // in Newtons (N)
  angle: number;     // in degrees
  // Component-based input
  useComponents: boolean; // true for Fx/Fy input, false for magnitude/angle
  fx: number;        // x-component in Newtons (N)
  fy: number;        // y-component in Newtons (N)
  // Acute angle with direction approach
  useAcuteAngle: boolean; // true for acute angle + direction, false for full angle
  acuteAngle: number;     // acute angle (0-90 degrees)
  xDirection: 'right' | 'left';   // direction for x-component
  yDirection: 'up' | 'down';      // direction for y-component
}

export interface Distances {
  d1: number; // position of C along x-axis from A
  d2: number; // position of A along y-axis from B
  d3: number; // position of D along x-axis from B
}

export interface AppState {
    pivotPoint: PivotPointId | null;
    forces: Record<PivotPointId, Force>;
    distances: Distances;
}

export type ConceptId = 'moment' | 'lever-arm' | 'equilibrium';
