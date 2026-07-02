// Fixed logical field dimensions. The canvas renders at this internal
// resolution (times devicePixelRatio) and is scaled responsively via CSS.

export const FIELD_W = 900;
export const FIELD_H = 560;

export const DISC_R = 27;
export const BALL_R = 13;

// Goal mouth (opening in the left/right walls), vertically centered.
export const GOAL_H = 180;
export const GOAL_TOP = (FIELD_H - GOAL_H) / 2;
export const GOAL_BOTTOM = GOAL_TOP + GOAL_H;
export const GOAL_DEPTH = 26; // visual net depth outside the wall

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
