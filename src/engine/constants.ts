// Fixed logical field dimensions. The canvas renders at this internal
// resolution (times devicePixelRatio) and is scaled responsively via CSS.

export const FIELD_W = 900;
export const FIELD_H = 560;

export const DISC_R = 31;
export const BALL_R = 16;

// Goal is a full rectangle standing INSIDE the pitch. Its back sits on the end
// line (net); its front (the goal line) is GOAL_BOX_DEPTH into the field. A ball
// fully past the front line scores; the sides (rails/posts) block from both
// sides, so a disc can drive inside the box to defend.
export const GOAL_H = 180; // mouth / box height
export const GOAL_TOP = (FIELD_H - GOAL_H) / 2;
export const GOAL_BOTTOM = GOAL_TOP + GOAL_H;
export const GOAL_BOX_DEPTH = 82; // how far the goal box reaches into the field
export const POST_R = 8; // front goal-post radius (solid)

// Penalty box markings (rectangle drawn on the pitch, no collision).
export const PENALTY_W = 155; // depth into the field
export const PENALTY_H = 320; // height, centered on the goal

// Physics — velocities are in px/second.
export const FIXED_DT = 1 / 120; // fixed physics step
export const LINEAR_DAMPING = 0.9; // velocity decay coefficient per second
export const STOP_SPEED = 6; // below this speed an object is snapped to rest
export const WALL_RESTITUTION = 0.72;
export const DISC_RESTITUTION = 0.92;
export const BALL_RESTITUTION = 0.9;

// Slingshot launch.
export const MAX_DRAG = 150; // px — beyond this, extra pull adds no force
export const SHOT_POWER = 11; // drag px -> velocity px/s multiplier
export const MAX_SHOT_SPEED = MAX_DRAG * SHOT_POWER;

// Masses (heavier disc pushes lighter ball).
export const DISC_MASS = 3;
export const BALL_MASS = 1;

// Timers (ms).
export const TURN_TIME_MS = 5000; // aim window per turn
export const MATCH_TIME_MS = 120000; // 2 minutes
export const CELEBRATION_MS = 1800;

export const INACTIVE_ALPHA = 0.4;
