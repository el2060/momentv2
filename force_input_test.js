// Force Input Methods Testing Script
// Tests all three input methods: Magnitude/Angle, Components, and Acute Angle

console.log("=== FORCE INPUT METHODS VERIFICATION ===");
console.log("Testing all force input methods for accuracy\n");

// Test data setup
const testMagnitude = 100;
const testAngles = [0, 30, 45, 90, 120, 135, 180, 225, 270, 315, 360];

console.log("1. MAGNITUDE/ANGLE TO COMPONENTS CONVERSION:");
console.log("Formula: Fx = Magnitude × cos(θ), Fy = Magnitude × sin(θ)\n");

testAngles.forEach(angle => {
    const angleRad = (angle * Math.PI) / 180;
    const fx = testMagnitude * Math.cos(angleRad);
    const fy = testMagnitude * Math.sin(angleRad);

    console.log(`${angle}°: Fx = ${fx.toFixed(2)}, Fy = ${fy.toFixed(2)}`);
});

console.log("\n2. COMPONENTS TO MAGNITUDE/ANGLE CONVERSION:");
console.log("Formula: Magnitude = √(Fx² + Fy²), Angle = atan2(Fy, Fx)\n");

const testComponents = [
    { fx: 100, fy: 0 },
    { fx: 86.6, fy: 50 },
    { fx: 0, fy: 100 },
    { fx: -50, fy: 86.6 },
    { fx: -100, fy: 0 },
    { fx: 0, fy: -100 }
];

testComponents.forEach(({ fx, fy }) => {
    const magnitude = Math.sqrt(fx * fx + fy * fy);
    const angleRad = Math.atan2(fy, fx);
    const angleDeg = (angleRad * 180 / Math.PI + 360) % 360; // Ensure positive angle

    console.log(`Fx=${fx.toFixed(1)}, Fy=${fy.toFixed(1)}: Magnitude = ${magnitude.toFixed(2)}, Angle = ${angleDeg.toFixed(1)}°`);
});

console.log("\n3. ACUTE ANGLE CONVERSION VERIFICATION:");
console.log("Testing acute angle equivalents for all quadrants\n");

const getAcuteAngleEquivalent = (angle) => {
    // Normalize angle to 0-360 range
    angle = ((angle % 360) + 360) % 360;

    if (angle >= 0 && angle <= 90) {
        return { acute: angle, quadrant: 'I' };
    } else if (angle > 90 && angle <= 180) {
        return { acute: 180 - angle, quadrant: 'II' };
    } else if (angle > 180 && angle <= 270) {
        return { acute: angle - 180, quadrant: 'III' };
    } else {
        return { acute: 360 - angle, quadrant: 'IV' };
    }
};

const testAcuteAngles = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360];

testAcuteAngles.forEach(angle => {
    const result = getAcuteAngleEquivalent(angle);
    console.log(`${angle}° → Acute: ${result.acute.toFixed(1)}° (Quadrant ${result.quadrant})`);
});

console.log("\n4. ROUND-TRIP CONVERSION ACCURACY TEST:");
console.log("Testing conversion accuracy: Angle → Components → Angle\n");

const testRoundTrip = [0, 30, 45, 90, 135, 180, 225, 270, 315];

testRoundTrip.forEach(originalAngle => {
    // Step 1: Angle to components
    const angleRad = (originalAngle * Math.PI) / 180;
    const fx = testMagnitude * Math.cos(angleRad);
    const fy = testMagnitude * Math.sin(angleRad);

    // Step 2: Components back to angle
    const backAngleRad = Math.atan2(fy, fx);
    const backAngle = ((backAngleRad * 180 / Math.PI) + 360) % 360;

    const error = Math.abs(originalAngle - backAngle);
    const isAccurate = error < 0.01;

    console.log(`${originalAngle}° → Components → ${backAngle.toFixed(2)}° (Error: ${error.toFixed(4)}°) ${isAccurate ? '✓' : '✗'}`);
});

console.log("\n5. EDGE CASES TESTING:");
console.log("Testing boundary conditions and special cases\n");

const edgeCases = [
    { name: "Zero magnitude", magnitude: 0, angle: 45 },
    { name: "Negative magnitude", magnitude: -100, angle: 0 },
    { name: "Very large angle", magnitude: 100, angle: 720 },
    { name: "Negative angle", magnitude: 100, angle: -90 },
    { name: "Decimal angle", magnitude: 100, angle: 37.5 }
];

edgeCases.forEach(testCase => {
    const angleRad = (testCase.angle * Math.PI) / 180;
    const fx = testCase.magnitude * Math.cos(angleRad);
    const fy = testCase.magnitude * Math.sin(angleRad);

    console.log(`${testCase.name}: Magnitude=${testCase.magnitude}, Angle=${testCase.angle}°`);
    console.log(`  → Fx = ${fx.toFixed(2)}, Fy = ${fy.toFixed(2)}`);
});

console.log("\n=== FORCE INPUT VERIFICATION COMPLETE ===");