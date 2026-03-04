import { useCallback, useRef } from "react";
import { setTouchLeft, setTouchRight, setTouchJump } from "../game/input";

export function TouchControls() {
  // prevent context menu on long press
  const prevent = (e: React.TouchEvent | React.MouseEvent) =>
    e.preventDefault();

  return (
    <>
      <div className="touch-controls" onContextMenu={prevent as any}>
        <div className="touch-dpad">
          <TouchButton
            label="◀"
            onDown={() => setTouchLeft(true)}
            onUp={() => setTouchLeft(false)}
          />
          <TouchButton
            label="▶"
            onDown={() => setTouchRight(true)}
            onUp={() => setTouchRight(false)}
          />
        </div>
        <div className="touch-jump-area">
          <TouchButton
            label="JUMP"
            className="touch-btn-jump"
            onDown={() => setTouchJump(true)}
            onUp={() => setTouchJump(false)}
          />
        </div>
      </div>
    </>
  );
}

function TouchButton({
  label,
  className = "",
  onDown,
  onUp,
}: {
  label: string;
  className?: string;
  onDown: () => void;
  onUp: () => void;
}) {
  const pressed = useRef(false);

  const handleDown = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();
      if (!pressed.current) {
        pressed.current = true;
        onDown();
      }
    },
    [onDown],
  );

  const handleUp = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();
      pressed.current = false;
      onUp();
    },
    [onUp],
  );

  return (
    <button
      className={`touch-btn ${className}`}
      onTouchStart={handleDown}
      onTouchEnd={handleUp}
      onTouchCancel={handleUp}
      onMouseDown={handleDown}
      onMouseUp={handleUp}
      onMouseLeave={handleUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      {label}
    </button>
  );
}
