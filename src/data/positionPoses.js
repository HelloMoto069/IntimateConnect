/**
 * positionPoses.js
 * Maps each of 105 positions to a base template + unique angle overrides.
 * Each position gets visually distinct figure arrangements.
 */

import templates from './poseTemplates';
import {mergePose} from './posePrimitives';

/**
 * Position-to-template mapping with per-position overrides.
 * Overrides tweak the base template to make each position visually unique.
 */
const positionMap = {
  // === FACE-TO-FACE SITTING / TANTRIC ===
  pos_001: {t: 'tantricSeated', a: {headTilt: 10}, b: {headTilt: -10, leftLeg: {hip: 55, knee: 35}}},
  pos_006: {t: 'sittingFaceToFace', a: {torsoAngle: -5}, b: {y: 115, torsoAngle: 5}},
  pos_014: {t: 'sittingFaceToFace', a: {leftArm: {shoulder: 40, elbow: 50}}, b: {torsoAngle: 3}},
  pos_015: {t: 'tantricSeated', a: {headTilt: 12}, b: {headTilt: -12}},
  pos_039: {t: 'tantricSeated', a: {torsoAngle: -8}, b: {torsoAngle: 8, y: 118}},
  pos_040: {t: 'sittingFaceToFace', a: {leftLeg: {hip: 80, knee: 60}, rightLeg: {hip: -40, knee: -70}}, b: {leftLeg: {hip: 70, knee: 55}}},
  pos_044: {t: 'tantricSeated', a: {leftArm: {shoulder: 35, elbow: 65}}, b: {rightArm: {shoulder: -35, elbow: -65}}},
  pos_045: {t: 'tantricSeated', a: {torsoAngle: -3, headTilt: 6}, b: {torsoAngle: 3, headTilt: -6}},
  pos_052: {t: 'sittingFaceToFace', a: {torsoAngle: -15, leftLeg: {hip: 65, knee: 75}}, b: {torsoAngle: 15}},
  pos_057: {t: 'tantricSeated', a: {leftArm: {shoulder: 25, elbow: 55}}, b: {y: 112}},
  pos_059: {t: 'sittingFaceToFace', a: {leftLeg: {hip: 60, knee: 80}}, b: {rightLeg: {hip: -50, knee: -60}}},
  pos_067: {t: 'sittingFaceToFace', a: {torsoAngle: 5}, b: {y: 118, torsoAngle: -5}},
  pos_076: {t: 'sittingFaceToFace', a: {leftLeg: {hip: 65, knee: 55}}, b: {leftLeg: {hip: 55, knee: 45}}},
  pos_092: {t: 'sittingFaceToFace', a: {torsoAngle: -3}, b: {y: 122, leftLeg: {hip: 50, knee: 40}}},

  // === SITTING REAR ===
  pos_007: {t: 'sittingRearEntry', a: {torsoAngle: -8}, b: {torsoAngle: 8}},
  pos_027: {t: 'sittingRearEntry', a: {torsoAngle: -15, leftArm: {shoulder: 20, elbow: 20}}, b: {torsoAngle: 0}},
  pos_053: {t: 'sittingRearEntry', a: {torsoAngle: -10}, b: {y: 112, torsoAngle: 10}},
  pos_074: {t: 'sittingRearEntry', a: {leftLeg: {hip: 60, knee: 70}}, b: {leftLeg: {hip: 55, knee: 55}}},
  pos_083: {t: 'sittingRearEntry', a: {torsoAngle: -5}, b: {y: 118}},
  pos_086: {t: 'sittingRearEntry', a: {torsoAngle: -12}, b: {torsoAngle: 12, y: 110}},
  pos_094: {t: 'sittingRearEntry', a: {bodyAngle: 5}, b: {bodyAngle: 5, torsoAngle: 3}},
  pos_095: {t: 'sittingRearEntry', a: {leftArm: {shoulder: 35, elbow: 35}}, b: {torsoAngle: 7}},
  pos_103: {t: 'sittingRearEntry', a: {torsoAngle: -8}, b: {y: 108, torsoAngle: 12}},

  // === LYING FACE-TO-FACE (Missionary family) ===
  pos_002: {t: 'lyingFaceToFace', a: {}, b: {}},
  pos_003: {t: 'lyingFaceToFace', a: {y: 148}, b: {torsoAngle: -8}},
  pos_010: {t: 'lyingFaceToFace', a: {leftArm: {shoulder: 140, elbow: 50}}, b: {leftArm: {shoulder: 130, elbow: 50}}},
  pos_011: {t: 'lyingFaceToFace', a: {leftLeg: {hip: 40, knee: 50}}, b: {torsoAngle: -10}},
  pos_012: {t: 'lyingFaceToFace', a: {leftLeg: {hip: 30, knee: 60}, rightLeg: {hip: 150, knee: -30}}, b: {}},
  pos_013: {t: 'lyingFaceToFace', a: {leftLeg: {hip: 25, knee: 70}, bodyAngle: 85}, b: {bodyAngle: 95}},
  pos_026: {t: 'lyingFaceToFace', a: {leftLeg: {hip: 20, knee: 80}, rightLeg: {hip: 160, knee: -40}}, b: {torsoAngle: -12}},
  pos_028: {t: 'lyingFaceToFace', a: {y: 120, bodyAngle: 90}, b: {y: 148, bodyAngle: 90, torsoAngle: 5}},
  pos_033: {t: 'lyingFaceToFace', a: {bodyAngle: 80, leftLeg: {hip: 50, knee: 40}}, b: {bodyAngle: 100}},
  pos_034: {t: 'lyingFaceToFace', a: {leftLeg: {hip: 35, knee: 55}}, b: {torsoAngle: -15}},
  pos_036: {t: 'lyingFaceToFace', a: {leftLeg: {hip: 20, knee: 75}, rightLeg: {hip: 160, knee: -35}}, b: {torsoAngle: -14}},
  pos_046: {t: 'lyingFaceToFace', a: {leftLeg: {hip: 45, knee: 45}}, b: {leftLeg: {hip: 65, knee: 20}}},
  pos_051: {t: 'lyingFaceToFace', a: {leftArm: {shoulder: 160, elbow: 20}}, b: {leftArm: {shoulder: 150, elbow: 30}}},
  pos_054: {t: 'lyingFaceToFace', a: {}, b: {torsoAngle: -3, leftArm: {shoulder: 130, elbow: 30}}},
  pos_055: {t: 'lyingFaceToFace', a: {leftLeg: {hip: 45, knee: 40}}, b: {torsoAngle: -8}},
  pos_066: {t: 'lyingFaceToFace', a: {leftLeg: {hip: 50, knee: 35}, rightLeg: {hip: 130, knee: -30}}, b: {}},
  pos_070: {t: 'lyingFaceToFace', a: {bodyAngle: 85}, b: {bodyAngle: 95, torsoAngle: -5}},
  pos_072: {t: 'lyingFaceToFace', a: {leftLeg: {hip: 55, knee: 30}}, b: {y: 118, leftLeg: {hip: 75, knee: 10}}},
  pos_075: {t: 'lyingFaceToFace', a: {leftArm: {shoulder: 145, elbow: 40}}, b: {leftArm: {shoulder: 135, elbow: 45}}},
  pos_078: {t: 'lyingFaceToFace', a: {leftArm: {shoulder: 170, elbow: 10}, rightArm: {shoulder: 190, elbow: -10}}, b: {}},
  pos_082: {t: 'lyingFaceToFace', a: {leftLeg: {hip: 30, knee: 55}, rightLeg: {hip: 150, knee: -25}}, b: {torsoAngle: -10}},
  pos_085: {t: 'lyingFaceToFace', a: {leftArm: {shoulder: 155, elbow: 25}}, b: {leftArm: {shoulder: 145, elbow: 35}}},
  pos_087: {t: 'lyingFaceToFace', a: {y: 150}, b: {torsoAngle: -6}},
  pos_090: {t: 'lyingFaceToFace', a: {bodyAngle: 80, leftLeg: {hip: 55, knee: 35}}, b: {bodyAngle: 100, leftLeg: {hip: 55, knee: 35}}},

  // === LYING REAR ENTRY ===
  pos_005: {t: 'onTopReverse', a: {}, b: {torsoAngle: 8}},
  pos_023: {t: 'lyingRearEntry', a: {leftLeg: {hip: 55, knee: 25}}, b: {torsoAngle: -12}},
  pos_025: {t: 'lyingRearEntry', a: {leftLeg: {hip: 50, knee: 30}}, b: {leftLeg: {hip: 55, knee: 25}}},
  pos_038: {t: 'lyingRearEntry', a: {bodyAngle: -85}, b: {bodyAngle: 85, torsoAngle: -8}},
  pos_071: {t: 'lyingRearEntry', a: {torsoAngle: 5}, b: {torsoAngle: -12}},
  pos_077: {t: 'lyingRearEntry', a: {}, b: {torsoAngle: -8}},
  pos_093: {t: 'lyingRearEntry', a: {bodyAngle: -95}, b: {bodyAngle: 85}},

  // === PRONE (face-down) ===
  pos_024: {t: 'proneRear', a: {}, b: {torsoAngle: 12}},
  pos_032: {t: 'proneRear', a: {torsoAngle: 3}, b: {torsoAngle: 10, y: 132}},
  pos_041: {t: 'proneRear', a: {leftArm: {shoulder: 165, elbow: 25}}, b: {torsoAngle: 15}},
  pos_069: {t: 'proneRear', a: {}, b: {y: 128, torsoAngle: 13}},
  pos_097: {t: 'proneRear', a: {torsoAngle: 5}, b: {torsoAngle: 18}},

  // === ON TOP FACE-TO-FACE (Cowgirl family) ===
  pos_004: {t: 'onTopFaceToFace', a: {}, b: {}},
  pos_017: {t: 'onTopFaceToFace', a: {leftLeg: {hip: 45, knee: 40}}, b: {torsoAngle: -10}},
  pos_035: {t: 'onTopFaceToFace', a: {}, b: {torsoAngle: 5, leftArm: {shoulder: 20, elbow: 20}}},
  pos_048: {t: 'onTopFaceToFace', a: {leftArm: {shoulder: 125, elbow: 25}}, b: {torsoAngle: -8}},
  pos_058: {t: 'onTopFaceToFace', a: {}, b: {torsoAngle: -12, headTilt: -8}},
  pos_068: {t: 'onTopFaceToFace', a: {leftArm: {shoulder: 140, elbow: 30}}, b: {leftArm: {shoulder: 30, elbow: 25}}},
  pos_073: {t: 'onTopFaceToFace', a: {leftArm: {shoulder: 165, elbow: 15}}, b: {torsoAngle: -5}},
  pos_081: {t: 'onTopFaceToFace', a: {}, b: {bodyAngle: 15, torsoAngle: 5}},
  pos_099: {t: 'onTopFaceToFace', a: {y: 158}, b: {y: 108, torsoAngle: -10}},
  pos_101: {t: 'onTopFaceToFace', a: {}, b: {torsoAngle: 8, bodyAngle: 5}},

  // === ON TOP REVERSE ===
  pos_016: {t: 'onTopReverse', a: {leftLeg: {hip: 40, knee: 35}}, b: {torsoAngle: -15, y: 105}},
  pos_060: {t: 'onTopReverse', a: {leftLeg: {hip: 30, knee: 45}}, b: {torsoAngle: -20}},
  pos_064: {t: 'onTopReverse', a: {}, b: {bodyAngle: 20, torsoAngle: 15}},

  // === SIDE BY SIDE ===
  pos_008: {t: 'sideBySide', a: {bodyAngle: 85, torsoAngle: -3}, b: {bodyAngle: 95, torsoAngle: 3}},
  pos_009: {t: 'sideBySide', a: {leftLeg: {hip: 45, knee: 45}}, b: {rightLeg: {hip: 75, knee: 15}}},
  pos_029: {t: 'sideBySide', a: {bodyAngle: 82}, b: {bodyAngle: 98, leftLeg: {hip: 135, knee: -35}}},
  pos_037: {t: 'sideBySide', a: {headTilt: 8, leftArm: {shoulder: 115, elbow: 55}}, b: {headTilt: -8}},
  pos_043: {t: 'sideBySide', a: {torsoAngle: -8}, b: {torsoAngle: 8, leftArm: {shoulder: 175, elbow: 35}}},
  pos_047: {t: 'sideBySide', a: {bodyAngle: 83}, b: {bodyAngle: 97}},
  pos_049: {t: 'sideBySide', a: {leftLeg: {hip: 40, knee: 50}, bodyAngle: 75}, b: {rightLeg: {hip: 80, knee: 10}}},
  pos_056: {t: 'sideBySide', a: {bodyAngle: 85}, b: {bodyAngle: 85, torsoAngle: 8}},
  pos_080: {t: 'sideBySide', a: {bodyAngle: 87, headTilt: 3}, b: {bodyAngle: 93, headTilt: -3}},
  pos_102: {t: 'sideBySide', a: {bodyAngle: 84, leftArm: {shoulder: 118, elbow: 52}}, b: {bodyAngle: 96}},
  pos_104: {t: 'sideBySide', a: {leftLeg: {hip: 55, knee: 35}, torsoAngle: -10}, b: {rightLeg: {hip: 65, knee: 25}}},

  // === STANDING FACE-TO-FACE ===
  pos_018: {t: 'standingFaceToFace', a: {leftArm: {shoulder: 35, elbow: 45}}, b: {rightArm: {shoulder: -35, elbow: -45}}},
  pos_019: {t: 'standingLifted', a: {leftArm: {shoulder: 45, elbow: 55}}, b: {leftLeg: {hip: 65, knee: 45}}},
  pos_042: {t: 'standingFaceToFace', a: {torsoAngle: -5, headTilt: 8}, b: {torsoAngle: 5, headTilt: -8}},
  pos_050: {t: 'standingFaceToFace', a: {leftLeg: {hip: 5, knee: 3}}, b: {leftLeg: {hip: 60, knee: 30}, rightLeg: {hip: -8, knee: -3}}},
  pos_063: {t: 'standingFaceToFace', a: {headTilt: 6, leftArm: {shoulder: 25, elbow: 35}}, b: {headTilt: -6}},
  pos_079: {t: 'standingFaceToFace', a: {leftLeg: {hip: 30, knee: 25}}, b: {rightLeg: {hip: -30, knee: -25}}},

  // === STANDING REAR ===
  pos_020: {t: 'standingRear', a: {torsoAngle: 12}, b: {torsoAngle: -8}},
  pos_021: {t: 'standingRear', a: {torsoAngle: 20}, b: {torsoAngle: -12}},
  pos_030: {t: 'standingLifted', a: {torsoAngle: 5}, b: {bodyAngle: 0, torsoAngle: 25, y: 110, leftLeg: {hip: 50, knee: 40}}},
  pos_031: {t: 'standingRear', a: {torsoAngle: 15, y: 142}, b: {y: 148}},
  pos_065: {t: 'standingRear', a: {torsoAngle: 10}, b: {torsoAngle: -15, leftArm: {shoulder: 45, elbow: 35}}},
  pos_084: {t: 'standingRear', a: {torsoAngle: 8, leftLeg: {hip: 15, knee: 8}}, b: {torsoAngle: -12}},
  pos_088: {t: 'standingRear', a: {torsoAngle: 18, y: 140}, b: {torsoAngle: -5}},
  pos_091: {t: 'standingRear', a: {torsoAngle: 14}, b: {torsoAngle: -10, leftArm: {shoulder: 35, elbow: 25}}},
  pos_096: {t: 'standingFaceToFace', a: {torsoAngle: -20, leftLeg: {hip: 30, knee: 20}}, b: {torsoAngle: 20}},

  // === EDGE / FURNITURE ===
  pos_022: {t: 'edgeFurniture', a: {torsoAngle: -12}, b: {torsoAngle: 8}},
  pos_062: {t: 'edgeFurniture', a: {torsoAngle: -18, leftLeg: {hip: 45, knee: 55}}, b: {torsoAngle: 12}},

  // === KNEELING ===
  pos_061: {t: 'kneeling', a: {torsoAngle: -12}, b: {torsoAngle: 12}},

  // === TANTRIC LYING ===
  pos_089: {t: 'lyingFaceToFace', a: {leftArm: {shoulder: 148, elbow: 35}}, b: {leftArm: {shoulder: 138, elbow: 40}, torsoAngle: -3}},
  pos_098: {t: 'lyingFaceToFace', a: {headTilt: 5, leftArm: {shoulder: 155, elbow: 25}}, b: {headTilt: -5}},
  pos_100: {t: 'lyingFaceToFace', a: {leftArm: {shoulder: 145, elbow: 40}}, b: {leftArm: {shoulder: 135, elbow: 45}}},
  pos_105: {t: 'lyingFaceToFace', a: {bodyAngle: 88}, b: {bodyAngle: 92, torsoAngle: -4}},
};

// Cache for resolved poses
const _cache = {};

/**
 * Get the resolved pose for a position ID.
 * Returns { personA: poseConfig, personB: poseConfig }
 */
export function getPoseForPosition(positionId) {
  if (_cache[positionId]) return _cache[positionId];

  const mapping = positionMap[positionId];
  if (!mapping) {
    // Fallback: use lyingFaceToFace as default
    const fallback = templates.lyingFaceToFace;
    _cache[positionId] = {
      personA: {...fallback.personA},
      personB: {...fallback.personB},
    };
    return _cache[positionId];
  }

  const template = templates[mapping.t];
  if (!template) {
    const fallback = templates.lyingFaceToFace;
    _cache[positionId] = {
      personA: {...fallback.personA},
      personB: {...fallback.personB},
    };
    return _cache[positionId];
  }

  _cache[positionId] = {
    personA: mergePose(template.personA, mapping.a),
    personB: mergePose(template.personB, mapping.b),
  };

  return _cache[positionId];
}

/**
 * Get howTo step poses for animation.
 * Returns array of {personA, personB} for each step,
 * interpolated between neutral and final pose.
 */
export function getStepPoses(positionId, stepCount) {
  const finalPose = getPoseForPosition(positionId);
  if (!stepCount || stepCount <= 1) return [finalPose];

  const steps = [];
  for (let i = 0; i < stepCount; i++) {
    const progress = (i + 1) / stepCount;
    steps.push({
      personA: {
        x: finalPose.personA.x,
        y: finalPose.personA.y,
        bodyAngle: (finalPose.personA.bodyAngle || 0) * progress,
        torsoAngle: (finalPose.personA.torsoAngle || 0) * progress,
        headTilt: (finalPose.personA.headTilt || 0) * progress,
        leftArm: {
          shoulder: 20 + ((finalPose.personA.leftArm?.shoulder || 20) - 20) * progress,
          elbow: 10 + ((finalPose.personA.leftArm?.elbow || 10) - 10) * progress,
        },
        rightArm: {
          shoulder: -20 + ((finalPose.personA.rightArm?.shoulder || -20) + 20) * progress,
          elbow: -10 + ((finalPose.personA.rightArm?.elbow || -10) + 10) * progress,
        },
        leftLeg: {
          hip: 5 + ((finalPose.personA.leftLeg?.hip || 5) - 5) * progress,
          knee: (finalPose.personA.leftLeg?.knee || 0) * progress,
        },
        rightLeg: {
          hip: -5 + ((finalPose.personA.rightLeg?.hip || -5) + 5) * progress,
          knee: (finalPose.personA.rightLeg?.knee || 0) * progress,
        },
      },
      personB: {
        x: finalPose.personB.x,
        y: finalPose.personB.y,
        bodyAngle: (finalPose.personB.bodyAngle || 0) * progress,
        torsoAngle: (finalPose.personB.torsoAngle || 0) * progress,
        headTilt: (finalPose.personB.headTilt || 0) * progress,
        leftArm: {
          shoulder: 20 + ((finalPose.personB.leftArm?.shoulder || 20) - 20) * progress,
          elbow: 10 + ((finalPose.personB.leftArm?.elbow || 10) - 10) * progress,
        },
        rightArm: {
          shoulder: -20 + ((finalPose.personB.rightArm?.shoulder || -20) + 20) * progress,
          elbow: -10 + ((finalPose.personB.rightArm?.elbow || -10) + 10) * progress,
        },
        leftLeg: {
          hip: 5 + ((finalPose.personB.leftLeg?.hip || 5) - 5) * progress,
          knee: (finalPose.personB.leftLeg?.knee || 0) * progress,
        },
        rightLeg: {
          hip: -5 + ((finalPose.personB.rightLeg?.hip || -5) + 5) * progress,
          knee: (finalPose.personB.rightLeg?.knee || 0) * progress,
        },
      },
    });
  }
  return steps;
}

export default positionMap;
