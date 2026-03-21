/**
 * posePrimitives.js
 * Body model constants, forward kinematics, and neutral pose definitions
 * for the SVG stick-figure illustration system.
 */

// Body segment lengths (relative units, viewBox is 200x200)
export const SEGMENTS = {
  headRadius: 8,
  neckLength: 6,
  torsoLength: 30,
  upperArmLength: 18,
  lowerArmLength: 16,
  upperLegLength: 22,
  lowerLegLength: 20,
  shoulderWidth: 16, // half-width from center
  hipWidth: 10,
};

// Stroke styling
export const FIGURE_STYLE = {
  strokeWidth: 6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  headStrokeWidth: 2,
};

/**
 * Convert degrees to radians
 */
export function toRad(deg) {
  return (deg * Math.PI) / 180;
}

/**
 * Calculate endpoint from origin + angle + length
 * Angle: 0 = down, 90 = right, -90 = left, 180 = up
 */
export function endpoint(x, y, angleDeg, length) {
  const rad = toRad(angleDeg);
  return {
    x: x + Math.sin(rad) * length,
    y: y + Math.cos(rad) * length,
  };
}

/**
 * Forward kinematics: given a pose config, compute all joint positions.
 *
 * Pose config shape:
 * {
 *   x: number,          // base x position (hip center)
 *   y: number,          // base y position (hip center)
 *   bodyAngle: number,  // overall torso lean (0 = upright, + = lean right, - = lean left)
 *   torsoAngle: number, // torso tilt from vertical (0 = upright, + = forward lean)
 *   headTilt: number,   // head tilt relative to torso
 *   leftArm: { shoulder: number, elbow: number },
 *   rightArm: { shoulder: number, elbow: number },
 *   leftLeg: { hip: number, knee: number },
 *   rightLeg: { hip: number, knee: number },
 * }
 *
 * Returns an object of {x, y} points for each joint.
 */
export function computeJoints(pose) {
  const {
    x = 100,
    y = 120,
    bodyAngle = 0,
    torsoAngle = 0,
    headTilt = 0,
    leftArm = {shoulder: 30, elbow: 20},
    rightArm = {shoulder: -30, elbow: -20},
    leftLeg = {hip: 10, knee: 10},
    rightLeg = {hip: -10, knee: -10},
  } = pose;

  // Hip center is the base position
  const hipCenter = {x, y};

  // Torso goes upward from hip (angle 180 = up, adjusted by torsoAngle + bodyAngle)
  const torsoEndAngle = 180 + torsoAngle + bodyAngle;
  const shoulderCenter = endpoint(
    hipCenter.x,
    hipCenter.y,
    torsoEndAngle,
    SEGMENTS.torsoLength,
  );

  // Neck + Head
  const neckAngle = torsoEndAngle + headTilt;
  const neckTop = endpoint(
    shoulderCenter.x,
    shoulderCenter.y,
    neckAngle,
    SEGMENTS.neckLength,
  );
  const headCenter = endpoint(
    neckTop.x,
    neckTop.y,
    neckAngle,
    SEGMENTS.headRadius,
  );

  // Shoulders (perpendicular to torso)
  const shoulderPerp = torsoEndAngle + 90;
  const leftShoulder = endpoint(
    shoulderCenter.x,
    shoulderCenter.y,
    shoulderPerp,
    SEGMENTS.shoulderWidth / 2,
  );
  const rightShoulder = endpoint(
    shoulderCenter.x,
    shoulderCenter.y,
    shoulderPerp - 180,
    SEGMENTS.shoulderWidth / 2,
  );

  // Hips (perpendicular to torso, at hip center)
  const leftHip = endpoint(
    hipCenter.x,
    hipCenter.y,
    shoulderPerp,
    SEGMENTS.hipWidth / 2,
  );
  const rightHip = endpoint(
    hipCenter.x,
    hipCenter.y,
    shoulderPerp - 180,
    SEGMENTS.hipWidth / 2,
  );

  // Left arm
  const leftElbow = endpoint(
    leftShoulder.x,
    leftShoulder.y,
    leftArm.shoulder + bodyAngle,
    SEGMENTS.upperArmLength,
  );
  const leftHand = endpoint(
    leftElbow.x,
    leftElbow.y,
    leftArm.shoulder + leftArm.elbow + bodyAngle,
    SEGMENTS.lowerArmLength,
  );

  // Right arm
  const rightElbow = endpoint(
    rightShoulder.x,
    rightShoulder.y,
    rightArm.shoulder + bodyAngle,
    SEGMENTS.upperArmLength,
  );
  const rightHand = endpoint(
    rightElbow.x,
    rightElbow.y,
    rightArm.shoulder + rightArm.elbow + bodyAngle,
    SEGMENTS.lowerArmLength,
  );

  // Left leg
  const leftKnee = endpoint(
    leftHip.x,
    leftHip.y,
    leftLeg.hip + bodyAngle,
    SEGMENTS.upperLegLength,
  );
  const leftFoot = endpoint(
    leftKnee.x,
    leftKnee.y,
    leftLeg.hip + leftLeg.knee + bodyAngle,
    SEGMENTS.lowerLegLength,
  );

  // Right leg
  const rightKnee = endpoint(
    rightHip.x,
    rightHip.y,
    rightLeg.hip + bodyAngle,
    SEGMENTS.upperLegLength,
  );
  const rightFoot = endpoint(
    rightKnee.x,
    rightKnee.y,
    rightLeg.hip + rightLeg.knee + bodyAngle,
    SEGMENTS.lowerLegLength,
  );

  return {
    hipCenter,
    shoulderCenter,
    neckTop,
    headCenter,
    leftShoulder,
    rightShoulder,
    leftHip,
    rightHip,
    leftElbow,
    leftHand,
    rightElbow,
    rightHand,
    leftKnee,
    leftFoot,
    rightKnee,
    rightFoot,
  };
}

/**
 * Neutral standing pose — used as animation start state
 */
export const NEUTRAL_POSE = {
  x: 100,
  y: 130,
  bodyAngle: 0,
  torsoAngle: 0,
  headTilt: 0,
  leftArm: {shoulder: 20, elbow: 10},
  rightArm: {shoulder: -20, elbow: -10},
  leftLeg: {hip: 5, knee: 0},
  rightLeg: {hip: -5, knee: 0},
};

/**
 * Interpolate between two pose configs by a progress value (0-1)
 */
export function interpolatePose(poseA, poseB, progress) {
  const lerp = (a, b) => a + (b - a) * progress;

  return {
    x: lerp(poseA.x || 100, poseB.x || 100),
    y: lerp(poseA.y || 130, poseB.y || 130),
    bodyAngle: lerp(poseA.bodyAngle || 0, poseB.bodyAngle || 0),
    torsoAngle: lerp(poseA.torsoAngle || 0, poseB.torsoAngle || 0),
    headTilt: lerp(poseA.headTilt || 0, poseB.headTilt || 0),
    leftArm: {
      shoulder: lerp(
        poseA.leftArm?.shoulder || 20,
        poseB.leftArm?.shoulder || 20,
      ),
      elbow: lerp(poseA.leftArm?.elbow || 10, poseB.leftArm?.elbow || 10),
    },
    rightArm: {
      shoulder: lerp(
        poseA.rightArm?.shoulder || -20,
        poseB.rightArm?.shoulder || -20,
      ),
      elbow: lerp(
        poseA.rightArm?.elbow || -10,
        poseB.rightArm?.elbow || -10,
      ),
    },
    leftLeg: {
      hip: lerp(poseA.leftLeg?.hip || 5, poseB.leftLeg?.hip || 5),
      knee: lerp(poseA.leftLeg?.knee || 0, poseB.leftLeg?.knee || 0),
    },
    rightLeg: {
      hip: lerp(poseA.rightLeg?.hip || -5, poseB.rightLeg?.hip || -5),
      knee: lerp(poseA.rightLeg?.knee || 0, poseB.rightLeg?.knee || 0),
    },
  };
}

/**
 * Deep merge a pose with overrides (for template + position-specific adjustments)
 */
export function mergePose(base, overrides) {
  if (!overrides) return {...base};
  return {
    x: overrides.x ?? base.x,
    y: overrides.y ?? base.y,
    bodyAngle: overrides.bodyAngle ?? base.bodyAngle,
    torsoAngle: overrides.torsoAngle ?? base.torsoAngle,
    headTilt: overrides.headTilt ?? base.headTilt,
    leftArm: {
      shoulder: overrides.leftArm?.shoulder ?? base.leftArm?.shoulder ?? 20,
      elbow: overrides.leftArm?.elbow ?? base.leftArm?.elbow ?? 10,
    },
    rightArm: {
      shoulder: overrides.rightArm?.shoulder ?? base.rightArm?.shoulder ?? -20,
      elbow: overrides.rightArm?.elbow ?? base.rightArm?.elbow ?? -10,
    },
    leftLeg: {
      hip: overrides.leftLeg?.hip ?? base.leftLeg?.hip ?? 5,
      knee: overrides.leftLeg?.knee ?? base.leftLeg?.knee ?? 0,
    },
    rightLeg: {
      hip: overrides.rightLeg?.hip ?? base.rightLeg?.hip ?? -5,
      knee: overrides.rightLeg?.knee ?? base.rightLeg?.knee ?? 0,
    },
  };
}
