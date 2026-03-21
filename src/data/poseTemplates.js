/**
 * poseTemplates.js
 * 15 base pose templates for position categories.
 * Each template defines personA and personB poses.
 * Angles: 0 = straight down, 180 = straight up, 90 = right, -90 = left
 */

const templates = {
  // === LYING DOWN ===

  lyingFaceToFace: {
    // Missionary family — A on back, B on top facing down
    personA: {
      x: 100, y: 145, bodyAngle: 90, torsoAngle: 0, headTilt: 0,
      leftArm: {shoulder: 150, elbow: 30},
      rightArm: {shoulder: 200, elbow: -20},
      leftLeg: {hip: 60, knee: 30},
      rightLeg: {hip: 120, knee: -20},
    },
    personB: {
      x: 100, y: 120, bodyAngle: 90, torsoAngle: -5, headTilt: -5,
      leftArm: {shoulder: 140, elbow: 40},
      rightArm: {shoulder: 210, elbow: -30},
      leftLeg: {hip: 70, knee: 15},
      rightLeg: {hip: 110, knee: -15},
    },
  },

  lyingRearEntry: {
    // A face-down, B behind/above
    personA: {
      x: 100, y: 150, bodyAngle: -90, torsoAngle: 0, headTilt: 0,
      leftArm: {shoulder: 160, elbow: 40},
      rightArm: {shoulder: 200, elbow: -20},
      leftLeg: {hip: 60, knee: 20},
      rightLeg: {hip: 120, knee: -20},
    },
    personB: {
      x: 100, y: 120, bodyAngle: 90, torsoAngle: -10, headTilt: 0,
      leftArm: {shoulder: 120, elbow: 40},
      rightArm: {shoulder: 240, elbow: -40},
      leftLeg: {hip: 60, knee: 20},
      rightLeg: {hip: 120, knee: -15},
    },
  },

  proneRear: {
    // A flat on stomach, B on top from behind
    personA: {
      x: 100, y: 155, bodyAngle: -90, torsoAngle: 0, headTilt: 10,
      leftArm: {shoulder: 170, elbow: 30},
      rightArm: {shoulder: 190, elbow: -30},
      leftLeg: {hip: 80, knee: 5},
      rightLeg: {hip: 100, knee: -5},
    },
    personB: {
      x: 100, y: 130, bodyAngle: -90, torsoAngle: 15, headTilt: -5,
      leftArm: {shoulder: 140, elbow: 40},
      rightArm: {shoulder: 220, elbow: -40},
      leftLeg: {hip: 50, knee: 30},
      rightLeg: {hip: 130, knee: -30},
    },
  },

  sideBySide: {
    // Both lying on sides facing each other
    personA: {
      x: 75, y: 140, bodyAngle: 80, torsoAngle: -5, headTilt: 5,
      leftArm: {shoulder: 120, elbow: 50},
      rightArm: {shoulder: 180, elbow: -30},
      leftLeg: {hip: 50, knee: 40},
      rightLeg: {hip: 110, knee: -20},
    },
    personB: {
      x: 125, y: 140, bodyAngle: 100, torsoAngle: 5, headTilt: -5,
      leftArm: {shoulder: 180, elbow: 30},
      rightArm: {shoulder: 240, elbow: -50},
      leftLeg: {hip: 130, knee: -40},
      rightLeg: {hip: 70, knee: 20},
    },
  },

  // === SITTING ===

  sittingFaceToFace: {
    // Lotus family — both seated facing each other
    personA: {
      x: 85, y: 135, bodyAngle: 0, torsoAngle: 0, headTilt: 5,
      leftArm: {shoulder: 50, elbow: 40},
      rightArm: {shoulder: -50, elbow: -40},
      leftLeg: {hip: 70, knee: 70},
      rightLeg: {hip: -30, knee: -80},
    },
    personB: {
      x: 115, y: 120, bodyAngle: 0, torsoAngle: 0, headTilt: -5,
      leftArm: {shoulder: 40, elbow: 30},
      rightArm: {shoulder: -40, elbow: -30},
      leftLeg: {hip: 60, knee: 50},
      rightLeg: {hip: -60, knee: -50},
    },
  },

  sittingRearEntry: {
    // A seated, B on lap facing away
    personA: {
      x: 90, y: 135, bodyAngle: 0, torsoAngle: -5, headTilt: 0,
      leftArm: {shoulder: 30, elbow: 30},
      rightArm: {shoulder: -30, elbow: -30},
      leftLeg: {hip: 70, knee: 60},
      rightLeg: {hip: -30, knee: -80},
    },
    personB: {
      x: 110, y: 115, bodyAngle: 0, torsoAngle: 5, headTilt: 0,
      leftArm: {shoulder: 25, elbow: 15},
      rightArm: {shoulder: -25, elbow: -15},
      leftLeg: {hip: 50, knee: 50},
      rightLeg: {hip: -50, knee: -50},
    },
  },

  tantricSeated: {
    // Deep embrace seated — very close, wrapped
    personA: {
      x: 85, y: 140, bodyAngle: 0, torsoAngle: -5, headTilt: 8,
      leftArm: {shoulder: 30, elbow: 60},
      rightArm: {shoulder: -30, elbow: -60},
      leftLeg: {hip: 75, knee: 65},
      rightLeg: {hip: -25, knee: -85},
    },
    personB: {
      x: 105, y: 115, bodyAngle: 0, torsoAngle: 5, headTilt: -8,
      leftArm: {shoulder: 35, elbow: 55},
      rightArm: {shoulder: -35, elbow: -55},
      leftLeg: {hip: 60, knee: 40},
      rightLeg: {hip: -60, knee: -40},
    },
  },

  // === ON TOP ===

  onTopFaceToFace: {
    // Cowgirl — A on back, B straddling on top
    personA: {
      x: 100, y: 155, bodyAngle: 90, torsoAngle: 0, headTilt: 0,
      leftArm: {shoulder: 130, elbow: 20},
      rightArm: {shoulder: 230, elbow: -20},
      leftLeg: {hip: 50, knee: 35},
      rightLeg: {hip: 130, knee: -35},
    },
    personB: {
      x: 100, y: 110, bodyAngle: 0, torsoAngle: 0, headTilt: 0,
      leftArm: {shoulder: 25, elbow: 15},
      rightArm: {shoulder: -25, elbow: -15},
      leftLeg: {hip: 55, knee: 60},
      rightLeg: {hip: -55, knee: -60},
    },
  },

  onTopReverse: {
    // Reverse cowgirl — A on back, B on top facing away
    personA: {
      x: 100, y: 155, bodyAngle: 90, torsoAngle: 0, headTilt: 0,
      leftArm: {shoulder: 130, elbow: 20},
      rightArm: {shoulder: 230, elbow: -20},
      leftLeg: {hip: 50, knee: 30},
      rightLeg: {hip: 130, knee: -30},
    },
    personB: {
      x: 100, y: 110, bodyAngle: 0, torsoAngle: 10, headTilt: 10,
      leftArm: {shoulder: 20, elbow: 20},
      rightArm: {shoulder: -20, elbow: -20},
      leftLeg: {hip: 55, knee: 55},
      rightLeg: {hip: -55, knee: -55},
    },
  },

  // === STANDING ===

  standingFaceToFace: {
    // Both standing, facing each other
    personA: {
      x: 80, y: 145, bodyAngle: 0, torsoAngle: 0, headTilt: 5,
      leftArm: {shoulder: 30, elbow: 40},
      rightArm: {shoulder: -40, elbow: -50},
      leftLeg: {hip: 10, knee: 5},
      rightLeg: {hip: -10, knee: -5},
    },
    personB: {
      x: 120, y: 145, bodyAngle: 0, torsoAngle: 0, headTilt: -5,
      leftArm: {shoulder: 40, elbow: 50},
      rightArm: {shoulder: -30, elbow: -40},
      leftLeg: {hip: 10, knee: 5},
      rightLeg: {hip: -10, knee: -5},
    },
  },

  standingRear: {
    // Both standing, B behind A
    personA: {
      x: 90, y: 145, bodyAngle: 0, torsoAngle: 15, headTilt: -5,
      leftArm: {shoulder: 20, elbow: 15},
      rightArm: {shoulder: -20, elbow: -15},
      leftLeg: {hip: 10, knee: 5},
      rightLeg: {hip: -10, knee: -5},
    },
    personB: {
      x: 110, y: 145, bodyAngle: 0, torsoAngle: -10, headTilt: 5,
      leftArm: {shoulder: 40, elbow: 30},
      rightArm: {shoulder: -40, elbow: -30},
      leftLeg: {hip: 10, knee: 5},
      rightLeg: {hip: -10, knee: -5},
    },
  },

  standingLifted: {
    // Standing with one partner lifted
    personA: {
      x: 90, y: 150, bodyAngle: 0, torsoAngle: -5, headTilt: 5,
      leftArm: {shoulder: 40, elbow: 60},
      rightArm: {shoulder: -40, elbow: -60},
      leftLeg: {hip: 8, knee: 3},
      rightLeg: {hip: -8, knee: -3},
    },
    personB: {
      x: 110, y: 105, bodyAngle: 0, torsoAngle: 5, headTilt: -5,
      leftArm: {shoulder: 30, elbow: 50},
      rightArm: {shoulder: -30, elbow: -50},
      leftLeg: {hip: 60, knee: 50},
      rightLeg: {hip: -60, knee: -50},
    },
  },

  // === OTHER ===

  edgeFurniture: {
    // A on edge (sitting), B standing/kneeling
    personA: {
      x: 80, y: 130, bodyAngle: 0, torsoAngle: -15, headTilt: 5,
      leftArm: {shoulder: 30, elbow: 30},
      rightArm: {shoulder: -50, elbow: -20},
      leftLeg: {hip: 50, knee: 50},
      rightLeg: {hip: -10, knee: -60},
    },
    personB: {
      x: 120, y: 145, bodyAngle: 0, torsoAngle: 10, headTilt: -5,
      leftArm: {shoulder: 40, elbow: 30},
      rightArm: {shoulder: -40, elbow: -30},
      leftLeg: {hip: 15, knee: 10},
      rightLeg: {hip: -15, knee: -10},
    },
  },

  kneeling: {
    // One or both kneeling
    personA: {
      x: 85, y: 140, bodyAngle: 0, torsoAngle: -10, headTilt: 5,
      leftArm: {shoulder: 30, elbow: 40},
      rightArm: {shoulder: -30, elbow: -40},
      leftLeg: {hip: 40, knee: 80},
      rightLeg: {hip: -20, knee: -90},
    },
    personB: {
      x: 115, y: 140, bodyAngle: 0, torsoAngle: 10, headTilt: -5,
      leftArm: {shoulder: 35, elbow: 35},
      rightArm: {shoulder: -35, elbow: -35},
      leftLeg: {hip: 20, knee: 90},
      rightLeg: {hip: -40, knee: -80},
    },
  },

  acrobatic: {
    // Advanced/flexible positions
    personA: {
      x: 90, y: 135, bodyAngle: 0, torsoAngle: -20, headTilt: 10,
      leftArm: {shoulder: 60, elbow: 40},
      rightArm: {shoulder: -60, elbow: -40},
      leftLeg: {hip: 80, knee: 30},
      rightLeg: {hip: -40, knee: -70},
    },
    personB: {
      x: 110, y: 115, bodyAngle: 0, torsoAngle: 20, headTilt: -10,
      leftArm: {shoulder: 50, elbow: 50},
      rightArm: {shoulder: -50, elbow: -50},
      leftLeg: {hip: 70, knee: 40},
      rightLeg: {hip: -70, knee: -40},
    },
  },
};

export default templates;
