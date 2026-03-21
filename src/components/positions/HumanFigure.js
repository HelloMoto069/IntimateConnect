/**
 * HumanFigure.js
 * Renders a smooth, filled human silhouette using SVG paths.
 * Uses bezier curves for realistic body shapes — similar to
 * 3D mannequin-style silhouettes used in position guide apps.
 */

import React, {memo, useMemo} from 'react';
import {Path, Circle, Ellipse, G} from 'react-native-svg';
import {computeJoints, SEGMENTS} from '@data/posePrimitives';

/**
 * Generate a smooth tapered limb path between two points.
 * Creates a filled shape wider at the start, narrower at the end.
 */
function limbPath(x1, y1, x2, y2, widthStart, widthEnd) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  // Perpendicular unit vector
  const px = -dy / len;
  const py = dx / len;

  const ws = widthStart / 2;
  const we = widthEnd / 2;

  // Four corners of the tapered shape
  const ax = x1 + px * ws;
  const ay = y1 + py * ws;
  const bx = x1 - px * ws;
  const by = y1 - py * ws;
  const cx = x2 - px * we;
  const cy = y2 - py * we;
  const ex = x2 + px * we;
  const ey = y2 + py * we;

  // Mid control points for smooth curves
  const mx1 = (ax + ex) / 2 + px * 1.5;
  const my1 = (ay + ey) / 2 + py * 1.5;
  const mx2 = (bx + cx) / 2 - px * 1.5;
  const my2 = (by + cy) / 2 - py * 1.5;

  return `M${ax},${ay} Q${mx1},${my1} ${ex},${ey} L${cx},${cy} Q${mx2},${my2} ${bx},${by} Z`;
}

/**
 * Generate a smooth torso path as a filled body shape.
 * Wider at shoulders, tapers at waist, widens at hips.
 */
function torsoPath(shoulders, hips, shoulderCenter, hipCenter) {
  const ls = shoulders.left;
  const rs = shoulders.right;
  const lh = hips.left;
  const rh = hips.right;

  // Waist points (narrower than shoulders and hips)
  const waistY = (shoulderCenter.y + hipCenter.y) / 2;
  const waistNarrow = 0.7; // waist is 70% of shoulder width
  const waistLx = shoulderCenter.x + (ls.x - shoulderCenter.x) * waistNarrow;
  const waistRx = shoulderCenter.x + (rs.x - shoulderCenter.x) * waistNarrow;

  return [
    `M${ls.x},${ls.y}`,
    // Left side: shoulder → waist → hip (smooth curve)
    `C${ls.x},${waistY - 5} ${waistLx},${waistY} ${waistLx},${waistY}`,
    `C${waistLx},${waistY} ${lh.x},${waistY + 5} ${lh.x},${lh.y}`,
    // Bottom: left hip → right hip
    `Q${hipCenter.x},${hipCenter.y + 4} ${rh.x},${rh.y}`,
    // Right side: hip → waist → shoulder
    `C${rh.x},${waistY + 5} ${waistRx},${waistY} ${waistRx},${waistY}`,
    `C${waistRx},${waistY} ${rs.x},${waistY - 5} ${rs.x},${rs.y}`,
    // Top: right shoulder → left shoulder
    `Q${shoulderCenter.x},${shoulderCenter.y - 3} ${ls.x},${ls.y}`,
    'Z',
  ].join(' ');
}

/**
 * Rounded end cap (hand/foot) as a small circle
 */
function endCapRadius(isHand) {
  return isHand ? 2.5 : 3;
}

const HumanFigure = ({pose, color = '#E94560', opacity = 1}) => {
  const joints = useMemo(() => computeJoints(pose), [pose]);

  // Lighter shade for body fill gradient effect
  const bodyFill = color;
  const darkerShade = color + 'CC';

  // Limb widths
  const UPPER_ARM_W = 5;
  const LOWER_ARM_W = 4;
  const HAND_W = 3;
  const UPPER_LEG_W = 7;
  const LOWER_LEG_W = 5.5;
  const FOOT_W = 4;
  const NECK_W = 4.5;

  return (
    <G opacity={opacity}>
      {/* === TORSO (filled body shape with waist curve) === */}
      <Path
        d={torsoPath(
          {left: joints.leftShoulder, right: joints.rightShoulder},
          {left: joints.leftHip, right: joints.rightHip},
          joints.shoulderCenter,
          joints.hipCenter,
        )}
        fill={bodyFill}
        stroke={darkerShade}
        strokeWidth={0.5}
      />

      {/* === NECK (tapered) === */}
      <Path
        d={limbPath(
          joints.shoulderCenter.x, joints.shoulderCenter.y,
          joints.neckTop.x, joints.neckTop.y,
          NECK_W + 1, NECK_W,
        )}
        fill={bodyFill}
      />

      {/* === HEAD (ellipse for more natural shape) === */}
      <Ellipse
        cx={joints.headCenter.x}
        cy={joints.headCenter.y}
        rx={SEGMENTS.headRadius * 0.85}
        ry={SEGMENTS.headRadius}
        fill={bodyFill}
        stroke={darkerShade}
        strokeWidth={0.5}
      />

      {/* === LEFT ARM === */}
      {/* Upper arm */}
      <Path
        d={limbPath(
          joints.leftShoulder.x, joints.leftShoulder.y,
          joints.leftElbow.x, joints.leftElbow.y,
          UPPER_ARM_W, LOWER_ARM_W,
        )}
        fill={bodyFill}
      />
      {/* Forearm */}
      <Path
        d={limbPath(
          joints.leftElbow.x, joints.leftElbow.y,
          joints.leftHand.x, joints.leftHand.y,
          LOWER_ARM_W, HAND_W,
        )}
        fill={bodyFill}
      />
      {/* Hand */}
      <Circle
        cx={joints.leftHand.x}
        cy={joints.leftHand.y}
        r={endCapRadius(true)}
        fill={bodyFill}
      />

      {/* === RIGHT ARM === */}
      <Path
        d={limbPath(
          joints.rightShoulder.x, joints.rightShoulder.y,
          joints.rightElbow.x, joints.rightElbow.y,
          UPPER_ARM_W, LOWER_ARM_W,
        )}
        fill={bodyFill}
      />
      <Path
        d={limbPath(
          joints.rightElbow.x, joints.rightElbow.y,
          joints.rightHand.x, joints.rightHand.y,
          LOWER_ARM_W, HAND_W,
        )}
        fill={bodyFill}
      />
      <Circle
        cx={joints.rightHand.x}
        cy={joints.rightHand.y}
        r={endCapRadius(true)}
        fill={bodyFill}
      />

      {/* === LEFT LEG === */}
      {/* Upper leg (thigh) */}
      <Path
        d={limbPath(
          joints.leftHip.x, joints.leftHip.y,
          joints.leftKnee.x, joints.leftKnee.y,
          UPPER_LEG_W, LOWER_LEG_W + 0.5,
        )}
        fill={bodyFill}
      />
      {/* Lower leg (calf) */}
      <Path
        d={limbPath(
          joints.leftKnee.x, joints.leftKnee.y,
          joints.leftFoot.x, joints.leftFoot.y,
          LOWER_LEG_W, FOOT_W,
        )}
        fill={bodyFill}
      />
      {/* Foot */}
      <Ellipse
        cx={joints.leftFoot.x}
        cy={joints.leftFoot.y}
        rx={endCapRadius(false)}
        ry={endCapRadius(false) * 0.7}
        fill={bodyFill}
      />

      {/* === RIGHT LEG === */}
      <Path
        d={limbPath(
          joints.rightHip.x, joints.rightHip.y,
          joints.rightKnee.x, joints.rightKnee.y,
          UPPER_LEG_W, LOWER_LEG_W + 0.5,
        )}
        fill={bodyFill}
      />
      <Path
        d={limbPath(
          joints.rightKnee.x, joints.rightKnee.y,
          joints.rightFoot.x, joints.rightFoot.y,
          LOWER_LEG_W, FOOT_W,
        )}
        fill={bodyFill}
      />
      <Ellipse
        cx={joints.rightFoot.x}
        cy={joints.rightFoot.y}
        rx={endCapRadius(false)}
        ry={endCapRadius(false) * 0.7}
        fill={bodyFill}
      />

      {/* === JOINT CIRCLES (smooth connections at elbows/knees) === */}
      <Circle cx={joints.leftElbow.x} cy={joints.leftElbow.y} r={2.2} fill={bodyFill} />
      <Circle cx={joints.rightElbow.x} cy={joints.rightElbow.y} r={2.2} fill={bodyFill} />
      <Circle cx={joints.leftKnee.x} cy={joints.leftKnee.y} r={3} fill={bodyFill} />
      <Circle cx={joints.rightKnee.x} cy={joints.rightKnee.y} r={3} fill={bodyFill} />
      {/* Shoulder joints */}
      <Circle cx={joints.leftShoulder.x} cy={joints.leftShoulder.y} r={2.8} fill={bodyFill} />
      <Circle cx={joints.rightShoulder.x} cy={joints.rightShoulder.y} r={2.8} fill={bodyFill} />
      {/* Hip joints */}
      <Circle cx={joints.leftHip.x} cy={joints.leftHip.y} r={3.2} fill={bodyFill} />
      <Circle cx={joints.rightHip.x} cy={joints.rightHip.y} r={3.2} fill={bodyFill} />
    </G>
  );
};

export default memo(HumanFigure);
