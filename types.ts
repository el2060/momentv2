

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
