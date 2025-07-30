import React from 'react';
import { AppState, Point, PivotPointId, Force } from '../types';
import { SVG_VIEWBOX_WIDTH, SVG_VIEWBOX_HEIGHT, SVG_PADDING, getApplicationPoints } from '../constants';
import { calculateSingleForceMoment } from '../services/momentCalculator';

interface ForceVectorProps {
  from: Point;
  fx: number;  // x-component of force
  fy: number;  // y-component of force
  scale: number;
}

const ForceVector: React.FC<ForceVectorProps> = ({ from, fx, fy, scale }) => {
  const magnitude = Math.sqrt(fx * fx + fy * fy);
  // Use fixed length for arrow regardless of magnitude
  const fixedLength = 60; // px, adjust as needed for visibility
  const unitX = magnitude > 0 ? fx / magnitude : 0;
  const unitY = magnitude > 0 ? fy / magnitude : 0;
  const to = {
    x: from.x + fixedLength * unitX,
    y: from.y - fixedLength * unitY, // Invert Y for SVG coordinates
  };

  return (
    <g className="stroke-gray-900 fill-gray-900" strokeWidth="3">
      <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} markerEnd="url(#arrowhead)" />
    </g>
  );
};

const LeverArmVisual: React.FC<{ pivot: Point, forceApp: Point, fx: number, fy: number }> = ({ pivot, forceApp, fx, fy }) => {
    const magnitude = Math.sqrt(fx * fx + fy * fy);
    if (magnitude === 0) return null;
    // Use fixed length for lever arm arrow
    const fixedLength = 60;
    const u = { x: fx / magnitude, y: -fy / magnitude }; // Invert Y for SVG coordinates
    const vecAP = { x: pivot.x - forceApp.x, y: pivot.y - forceApp.y };
    const t = vecAP.x * u.x + vecAP.y * u.y;
    const intersectionPoint = { x: forceApp.x + t * u.x, y: forceApp.y + t * u.y };

    if (Math.hypot(pivot.x - intersectionPoint.x, pivot.y - intersectionPoint.y) < 1) {
        return null;
    }

    const markerSize = 6;
    const p_perp = { x: -u.y, y: u.x };
    const p1 = { x: intersectionPoint.x + fixedLength * u.x, y: intersectionPoint.y + fixedLength * u.y };
    const p2 = { x: p1.x + markerSize * p_perp.x, y: p1.y + markerSize * p_perp.y };
    const p3 = { x: intersectionPoint.x + markerSize * p_perp.x, y: intersectionPoint.y + markerSize * p_perp.y };

    return (
        <g>
            <line x1={pivot.x} y1={pivot.y} x2={intersectionPoint.x} y2={intersectionPoint.y} className="stroke-gray-700" strokeWidth="3" strokeDasharray="6 3" />
            <polyline points={`${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`} className="stroke-gray-700 fill-none" strokeWidth="3" />
        </g>
    );
};

const RotationIndicator: React.FC<{center: Point, moment: number}> = ({ center, moment }) => {
    if (Math.abs(moment) < 0.01) return null;
    
    const isCCW = moment > 0;
    const path = isCCW
        ? "M20.49 16.21C18.91 18.59 16.14 20 13 20a7 7 0 01-7-7c0-2.34 1.15-4.44 2.95-5.73"
        : "M11.05 7.27C12.85 5.56 15.66 5 18 5a7 7 0 017 7c0 3.14-1.41 5.91-3.79 7.49";

    const colorClass = isCCW ? 'stroke-gray-800' : 'stroke-gray-600';
    const markerId = isCCW ? 'url(#rotation-arrowhead-ccw)' : 'url(#rotation-arrowhead-cw)';

    return (
        <g transform={`translate(${center.x - 13}, ${center.y - 13}) scale(1.4)`}>
            <path
                d={path}
                className={`fill-none ${colorClass}`}
                strokeWidth="3"
                strokeLinecap="round"
                markerEnd={markerId}
            />
        </g>
    );
};

interface DiagramProps extends AppState {
    expandedForceId: string | null;
}

const Diagram: React.FC<DiagramProps> = ({ forces, distances, pivotPoint, expandedForceId }) => {
  const points = getApplicationPoints(distances);
  
  const allX = Object.values(points).map(p => p.x);
  const allY = Object.values(points).map(p => p.y);
  const minX = Math.min(...allX);
  const maxX = Math.max(...allX);
  const minY = Math.min(...allY);
  const maxY = Math.max(...allY);
  const contentWidth = maxX - minX;
  const contentHeight = maxY - minY;
  const availableWidth = SVG_VIEWBOX_WIDTH - 2 * SVG_PADDING;
  const availableHeight = SVG_VIEWBOX_HEIGHT - 2 * SVG_PADDING;
  const scaleX = contentWidth > 0 ? availableWidth / contentWidth : 1;
  const scaleY = contentHeight > 0 ? availableHeight / contentHeight : 1;
  const scale = Math.min(scaleX, scaleY) * 0.9;

  const transformPoint = (p: Point): Point => ({
    x: SVG_PADDING + (p.x - minX) * scale,
    y: SVG_VIEWBOX_HEIGHT - SVG_PADDING - (p.y - minY) * scale,
  });

  const tPoints = {
    A: transformPoint(points.A),
    B: transformPoint(points.B),
    C: transformPoint(points.C),
    D: transformPoint(points.D),
  };

  const pathData = `M ${tPoints.C.x} ${tPoints.C.y} L ${tPoints.A.x} ${tPoints.A.y} L ${tPoints.B.x} ${tPoints.B.y} L ${tPoints.D.x} ${tPoints.D.y}`;
  const enabledForces = Object.values(forces).filter((f: Force) => f.isEnabled);

  const expandedForce = expandedForceId ? forces[expandedForceId as PivotPointId] : null;
  const singleMoment = expandedForce ? calculateSingleForceMoment(expandedForce, distances, pivotPoint) : 0;
  const totalMoment = pivotPoint
    ? Object.values(forces)
        .filter(f => f.isEnabled)
        .reduce((sum, f) => sum + calculateSingleForceMoment(f, distances, pivotPoint), 0)
    : 0;

  return (
    <div className="w-full h-full max-h-[calc(100vh-120px)] overflow-auto flex items-center justify-center">
      <svg viewBox={`0 0 ${SVG_VIEWBOX_WIDTH} ${SVG_VIEWBOX_HEIGHT}`} className="w-full h-full">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" className="fill-current" />
          </marker>
          <marker id="rotation-arrowhead-ccw" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <polygon points="0 0, 6 3, 0 6" className="fill-gray-800" />
          </marker>
          <marker id="rotation-arrowhead-cw" markerWidth="6" markerHeight="6" refX="1" refY="3" orient="auto">
              <polygon points="6 0, 0 3, 6 6" className="fill-gray-600" />
          </marker>
        </defs>
        
         {enabledForces.map(force => {
          const from = tPoints[force.id];
          const magnitude = Math.sqrt(force.fx * force.fx + force.fy * force.fy);
          if (magnitude === 0) return null;
          
          const unitX = force.fx / magnitude;
          const unitY = force.fy / magnitude;
          const lineLength = SVG_VIEWBOX_WIDTH * 2;
          const p1 = { x: from.x + lineLength * unitX, y: from.y - lineLength * unitY };
          const p2 = { x: from.x - lineLength * unitX, y: from.y + lineLength * unitY };
          return (
              <line 
                  key={`line-of-action-${force.id}`}
                  x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                  className="stroke-gray-500"
                  strokeWidth="2"
                  strokeDasharray="8 4" />
          );
        })}

        <path d={pathData} stroke="#1f2937" strokeWidth="12" fill="none" strokeLinecap="round" strokeLinejoin="round" />

        {Object.entries(tPoints).map(([id, p]) => (
          <g key={id}>
            <circle 
              cx={p.x} cy={p.y} r={id === pivotPoint ? 14 : 8} 
              className={id === pivotPoint ? "fill-yellow-400 stroke-yellow-700 animate-pulse" : "fill-gray-400 stroke-gray-600"}
              strokeWidth="4" 
            />
            <text x={p.x + 20} y={p.y - 20} className="fill-gray-900 font-bold text-base tracking-wider font-mono">{id}</text>
          </g>
        ))}

        {enabledForces.map(force => {
            const applicationPoint = tPoints[force.id];
            const moment = pivotPoint ? calculateSingleForceMoment(force, distances, pivotPoint) : 0;
            return (
                <g key={force.id}>
                    <ForceVector
                        from={applicationPoint}
                        fx={force.fx}
                        fy={force.fy}
                        scale={scale}
                    />
                    {/* Removed curved rotation arrows at pivot points */}
                </g>
            );
        })}
        
        {expandedForceId && expandedForce?.isEnabled && pivotPoint && (
          <LeverArmVisual 
            pivot={tPoints[pivotPoint]}
            forceApp={tPoints[expandedForceId as PivotPointId]}
            fx={forces[expandedForceId as PivotPointId].fx}
            fy={forces[expandedForceId as PivotPointId].fy}
          />
        )}

        {/* Removed RotationIndicator for resultant direction at pivot point */}

        <g className="fill-gray-900 text-xs font-mono font-bold">
          {distances.d1 > 0 && <text x={(tPoints.A.x + tPoints.C.x) / 2} y={tPoints.A.y - 25}>d1 = {distances.d1}m</text>}
          <text x={tPoints.A.x - 60} y={(tPoints.A.y + tPoints.B.y) / 2} dominantBaseline="middle">d2 = {distances.d2}m</text>
          {distances.d3 > 0 && <text x={(tPoints.B.x + tPoints.D.x) / 2} y={tPoints.B.y + 35}>d3 = {distances.d3}m</text>}
        </g>
      </svg>
      </div>
  );
};

export default Diagram;
