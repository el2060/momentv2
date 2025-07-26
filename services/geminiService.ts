

import { AppState, Force, PivotPointId, ConceptId } from "../types";
import { getApplicationPoints } from "../constants";

const degreesToRadians = (degrees: number): number => degrees * (Math.PI / 180);

// Local hardcoded explanations for educational concepts
const CONCEPT_EXPLANATIONS: Record<ConceptId, string> = {
  'moment': `
## What is a Moment?

A **moment** (or torque) is the turning effect of a force about a pivot point.

### Key Concepts:
- **Magnitude**: Force × Perpendicular Distance
- **Direction**: Clockwise (negative) or Counter-clockwise (positive)
- **Units**: Newton-meters (Nm)

### Sign Convention:
- **Positive (+)**: Counter-clockwise rotation
- **Negative (-)**: Clockwise rotation

### Formula:
**M = F × d⊥**

Where:
- M = Moment (Nm)
- F = Force magnitude (N)
- d⊥ = Perpendicular distance from pivot to line of action (m)

### Applications:
Moments are crucial in determining whether a structure will rotate or remain in equilibrium.
  `,
  'lever-arm': `
## Understanding the Lever Arm

The **lever arm** (also called moment arm) is the perpendicular distance from the pivot point to the line of action of the force.

### Key Points:
- It's the shortest distance from the pivot to the force's line of action
- Always measured perpendicular to the force direction
- Determines how effectively a force creates rotation

### Mathematical Definition:
For a force at angle θ with position vector **r** from the pivot:
- **Lever arm = |r| × sin(α)**
- Where α is the angle between the position vector and force direction

### Important Notes:
- The longer the lever arm, the greater the moment for the same force
- If the force passes through the pivot (lever arm = 0), no moment is created
- Maximum moment occurs when force is perpendicular to position vector
  `,
  'equilibrium': `
## Understanding Equilibrium

**Equilibrium** occurs when the sum of all moments about any point equals zero.

### Conditions for Rotational Equilibrium:
- **ΣM = 0** (Sum of all moments = 0)
- No net rotation occurs
- Structure remains balanced

### Types of Equilibrium:
- **Stable**: Returns to original position when slightly disturbed
- **Unstable**: Moves away from original position when disturbed  
- **Neutral**: Remains in new position when disturbed

### Practical Applications:
- Designing balanced see-saws and levers
- Structural engineering for stable buildings
- Mechanical systems like cranes and bridges
- Ensuring machinery operates without unwanted rotation

### Mathematical Check:
A system is in equilibrium when: **ΣM_clockwise = ΣM_counter-clockwise**
  `
};

export async function getForceExplanation(
    force: Force,
    pivotId: PivotPointId | null,
    distances: AppState['distances']
): Promise<string> {
    if (!pivotId) {
        return "Please select a pivot point to see force explanation.";
    }
    
    const points = getApplicationPoints(distances);
    const pivotCoords = points[pivotId];
    const appPoint = points[force.id];

    const r = { x: appPoint.x - pivotCoords.x, y: appPoint.y - pivotCoords.y };
    const angleRad = degreesToRadians(force.angle);
    const F = { x: force.magnitude * Math.cos(angleRad), y: force.magnitude * Math.sin(angleRad) };
    const moment = r.x * F.y - r.y * F.x;

    const leverArm = Math.abs(moment) / force.magnitude;
    const rotationDirection = moment > 0.01 ? "counter-clockwise (positive)" : moment < -0.01 ? "clockwise (negative)" : "zero (equilibrium)";

    return `
## Moment Calculation for Force ${force.name}

### Given Information:
- **Force Magnitude**: ${force.magnitude.toFixed(1)} N
- **Force Angle**: ${force.angle}° (measured from positive x-axis)
- **Application Point**: ${force.id} at (${appPoint.x.toFixed(2)}, ${appPoint.y.toFixed(2)}) m
- **Pivot Point**: ${pivotId} at (${pivotCoords.x.toFixed(2)}, ${pivotCoords.y.toFixed(2)}) m

### Step-by-Step Calculation:

**1. Position Vector (r):**
- From pivot ${pivotId} to application point ${force.id}
- r = <${r.x.toFixed(2)}, ${r.y.toFixed(2)}> m

**2. Force Components:**
- Fx = ${force.magnitude} × cos(${force.angle}°) = ${F.x.toFixed(2)} N
- Fy = ${force.magnitude} × sin(${force.angle}°) = ${F.y.toFixed(2)} N

**3. Moment Calculation:**
Using the cross product formula: **M = rx × Fy - ry × Fx**
- M = (${r.x.toFixed(2)} × ${F.y.toFixed(2)}) - (${r.y.toFixed(2)} × ${F.x.toFixed(2)})
- M = ${(r.x * F.y).toFixed(2)} - ${(r.y * F.x).toFixed(2)}
- **M = ${moment.toFixed(2)} Nm**

**4. Physical Interpretation:**
- **Lever Arm**: ${leverArm.toFixed(2)} m (perpendicular distance)
- **Rotation**: This force creates a **${rotationDirection}** moment
- **Effect**: ${Math.abs(moment) < 0.01 ? "No rotation - force passes through or very close to pivot" : `Tends to rotate the structure ${moment > 0 ? "counter-clockwise" : "clockwise"}`}

### Key Insight:
${Math.abs(moment) < 0.01 ? 
  "When the moment is zero, the force either passes through the pivot point or the lever arm is zero." : 
  `The ${Math.abs(moment) > 10 ? "large" : "small"} moment value indicates a ${Math.abs(moment) > 10 ? "strong" : "weak"} rotational tendency.`}
`;
}

export async function getConceptExplanation(conceptId: ConceptId): Promise<string> {
    return CONCEPT_EXPLANATIONS[conceptId] || "Concept explanation not available.";
}
