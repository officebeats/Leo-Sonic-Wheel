// ─── Input System ────────────────────────────────────────────────────────
export interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
  jumpPressed: boolean; // true only on the frame jump is first pressed
  pause: boolean;
}

const state: InputState = {
  left: false,
  right: false,
  jump: false,
  jumpPressed: false,
  pause: false,
};

let prevJump = false;

// ── Keyboard ─────────────────────────────────────────────────────────────
function onKeyDown(e: KeyboardEvent) {
  switch (e.code) {
    case "ArrowLeft":
    case "KeyA":
      state.left = true;
      break;
    case "ArrowRight":
    case "KeyD":
      state.right = true;
      break;
    case "ArrowUp":
    case "KeyW":
    case "Space":
      state.jump = true;
      e.preventDefault();
      break;
    case "Escape":
    case "KeyP":
      state.pause = true;
      break;
  }
}

function onKeyUp(e: KeyboardEvent) {
  switch (e.code) {
    case "ArrowLeft":
    case "KeyA":
      state.left = false;
      break;
    case "ArrowRight":
    case "KeyD":
      state.right = false;
      break;
    case "ArrowUp":
    case "KeyW":
    case "Space":
      state.jump = false;
      break;
  }
}

// ── Touch (called from React overlay) ────────────────────────────────────
export function setTouchLeft(v: boolean) {
  state.left = v;
}
export function setTouchRight(v: boolean) {
  state.right = v;
}
export function setTouchJump(v: boolean) {
  state.jump = v;
}
export function triggerPause() {
  state.pause = true;
}

// ── Lifecycle ────────────────────────────────────────────────────────────
export function initInput() {
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
}

export function destroyInput() {
  window.removeEventListener("keydown", onKeyDown);
  window.removeEventListener("keyup", onKeyUp);
}

/** Call once per frame AFTER reading state */
export function postFrameInput() {
  state.jumpPressed = state.jump && !prevJump;
  prevJump = state.jump;
  state.pause = false; // consumed
}

/** Call once per frame BEFORE physics */
export function preFrameInput() {
  state.jumpPressed = state.jump && !prevJump;
}

export function getInput(): Readonly<InputState> {
  return state;
}
