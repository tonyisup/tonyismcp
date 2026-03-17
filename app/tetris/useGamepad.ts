import { useEffect, useRef } from "react";

interface GamepadActions {
  rotate: () => void;
  togglePause: () => void;
  holdPiece: () => void;
  startRepeat: (action: "moveLeft" | "moveRight" | "moveDown") => void;
  clearRepeat: () => void;
}

export function useGamepad(actions: GamepadActions) {
  const requestRef = useRef<number>(0);
  const lastState = useRef({
    moveLeft: false,
    moveRight: false,
    moveDown: false,
    rotate: false,
    pause: false,
    stash: false,
  });

  const actionsRef = useRef(actions);
  actionsRef.current = actions;

  useEffect(() => {
    const update = () => {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];

      let moveLeft = false;
      let moveRight = false;
      let moveDown = false;
      let rotate = false;
      let pause = false;
      let stash = false;

      // Find first connected gamepad
      for (let i = 0; i < gamepads.length; i++) {
        const gp = gamepads[i];
        if (!gp) continue;

        // D-pad Left or Joystick Left
        if ((gp.buttons[14] && gp.buttons[14].pressed) || (gp.axes[0] && gp.axes[0] < -0.5)) {
          moveLeft = true;
        }
        // D-pad Right or Joystick Right
        if ((gp.buttons[15] && gp.buttons[15].pressed) || (gp.axes[0] && gp.axes[0] > 0.5)) {
          moveRight = true;
        }
        // D-pad Down or Joystick Down
        if ((gp.buttons[13] && gp.buttons[13].pressed) || (gp.axes[1] && gp.axes[1] > 0.5)) {
          moveDown = true;
        }

        // Buttons
        // Joycon A (rotate) is mapped to standard button 1 (right) or 0 (bottom).
        // The spec asked for A to map to rotate. We will check button 1 (Standard mapping for A on switch).
        // Let's also check 0 just in case.
        if ((gp.buttons[1] && gp.buttons[1].pressed) || (gp.buttons[0] && gp.buttons[0].pressed)) {
          rotate = true;
        }
        // Joycon X (pause) is mapped to standard button 3 (top).
        if (gp.buttons[3] && gp.buttons[3].pressed) {
          pause = true;
        }
        // Joycon Y (stash) is mapped to standard button 2 (left).
        if (gp.buttons[2] && gp.buttons[2].pressed) {
          stash = true;
        }

        // We only process the first active gamepad
        break;
      }

      // Movement logic (start/clear repeat)
      const prev = lastState.current;

      // If a movement direction was just pressed
      if (moveLeft && !prev.moveLeft) {
        actionsRef.current.startRepeat("moveLeft");
      } else if (moveRight && !prev.moveRight) {
        actionsRef.current.startRepeat("moveRight");
      } else if (moveDown && !prev.moveDown) {
        actionsRef.current.startRepeat("moveDown");
      }

      // If a specific movement was just released, clear the repeat.
      // If another direction is still held, we restart the repeat for that direction.
      if ((prev.moveLeft && !moveLeft) || (prev.moveRight && !moveRight) || (prev.moveDown && !moveDown)) {
        actionsRef.current.clearRepeat();
        if (moveLeft) actionsRef.current.startRepeat("moveLeft");
        else if (moveRight) actionsRef.current.startRepeat("moveRight");
        else if (moveDown) actionsRef.current.startRepeat("moveDown");
      }

      // Single action triggers on press
      if (rotate && !prev.rotate) {
        actionsRef.current.rotate();
      }
      if (pause && !prev.pause) {
        actionsRef.current.togglePause();
      }
      if (stash && !prev.stash) {
        actionsRef.current.holdPiece();
      }

      lastState.current = { moveLeft, moveRight, moveDown, rotate, pause, stash };

      requestRef.current = requestAnimationFrame(update);
    };

    requestRef.current = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(requestRef.current);
    };
  }, []);
}
