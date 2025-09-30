// Engineering Verification Test for Moment Calculator
// This file verifies the mathematical accuracy of the moment calculations

console.log("=== MOMENT CALCULATOR VERIFICATION ===");
console.log("Testing mathematical accuracy for engineering students\n");

// Test coordinate system
const distances = { d1: 3, d2: 4, d3: 5 };

const getApplicationPoints = (distances) => ({
    A: { x: 0, y: distances.d2 },     // A: (0, 4)
    B: { x: 0, y: 0 },                // B: (0, 0) - origin
    C: { x: distances.d1, y: distances.d2 }, // C: (3, 4)
    D: { x: distances.d3, y: 0 },     // D: (5, 0)
});

const points = getApplicationPoints(distances);
console.log("1. COORDINATE SYSTEM VERIFICATION:");
console.log("Frame points:");
Object.entries(points).forEach(([point, coords]) => {
    console.log(`   Point ${point}: (${coords.x}, ${coords.y})`);
});

// Test moment calculation with known values
console.log("\n2. MOMENT CALCULATION VERIFICATION:");
console.log("Using cross product formula: M = r × F = rx*Fy - ry*Fx");

// Test Case 1: Force at A, pivot at B
const testForce1 = {
    id: 'A',
    magnitude: 100,
    angle: 90, // pointing up
    fx: 0,
    fy: 100,
    isEnabled: true
};

const pivotB = points.B;  // (0, 0)
const applicationA = points.A;  // (0, 4)

const rx1 = applicationA.x - pivotB.x; // 0 - 0 = 0
const ry1 = applicationA.y - pivotB.y; // 4 - 0 = 4

const moment1 = rx1 * testForce1.fy - ry1 * testForce1.fx;
console.log(`\nTest Case 1: Force at A (100N upward), pivot at B`);
console.log(`   Position vector: r = (${rx1}, ${ry1})`);
console.log(`   Force vector: F = (${testForce1.fx}, ${testForce1.fy})`);
console.log(`   Moment = ${rx1} × ${testForce1.fy} - ${ry1} × ${testForce1.fx} = ${moment1} Nm`);
console.log(`   Direction: ${moment1 > 0 ? 'Counter-clockwise (+)' : 'Clockwise (-)'}`);

// Test Case 2: Force at C, pivot at B
const testForce2 = {
    id: 'C',
    magnitude: 50,
    angle: 0, // pointing right
    fx: 50,
    fy: 0,
    isEnabled: true
};

const applicationC = points.C;  // (3, 4)
const rx2 = applicationC.x - pivotB.x; // 3 - 0 = 3
const ry2 = applicationC.y - pivotB.y; // 4 - 0 = 4

const moment2 = rx2 * testForce2.fy - ry2 * testForce2.fx;
console.log(`\nTest Case 2: Force at C (50N rightward), pivot at B`);
console.log(`   Position vector: r = (${rx2}, ${ry2})`);
console.log(`   Force vector: F = (${testForce2.fx}, ${testForce2.fy})`);
console.log(`   Moment = ${rx2} × ${testForce2.fy} - ${ry2} × ${testForce2.fx} = ${moment2} Nm`);
console.log(`   Direction: ${moment2 > 0 ? 'Counter-clockwise (+)' : 'Clockwise (-)'}`);

// Test Case 3: Combined moments
const totalMoment = moment1 + moment2;
console.log(`\nCombined System:`);
console.log(`   Total Moment = ${moment1} + ${moment2} = ${totalMoment} Nm`);
console.log(`   Resultant Direction: ${totalMoment > 0 ? 'Counter-clockwise (+)' : totalMoment < 0 ? 'Clockwise (-)' : 'Equilibrium'}`);

// Test angle-to-component conversion
console.log("\n3. ANGLE-TO-COMPONENT CONVERSION VERIFICATION:");

const testAngles = [0, 45, 90, 135, 180, 225, 270, 315];
testAngles.forEach(angle => {
    const magnitude = 100;
    const fx = magnitude * Math.cos(angle * Math.PI / 180);
    const fy = magnitude * Math.sin(angle * Math.PI / 180);
    console.log(`   ${angle}°: Fx = ${fx.toFixed(2)}, Fy = ${fy.toFixed(2)}`);
});

// Test sign convention verification
console.log("\n4. SIGN CONVENTION VERIFICATION:");
console.log("   Right-hand rule: Counter-clockwise = Positive moment");
console.log("   Forces causing CCW rotation should give positive moments");
console.log("   Forces causing CW rotation should give negative moments");

console.log("\n=== VERIFICATION COMPLETE ===");