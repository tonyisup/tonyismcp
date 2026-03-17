# Plan
1. Update `app/tetris/page.tsx` or create a hook to support Gamepad API.
2. I should probably add `useGamepad` hook or just integrate `navigator.getGamepads()` in a `requestAnimationFrame` loop inside `useEffect`.
3. Map standard Gamepad API buttons:
   - D-pad Left (index 14) or Left Stick X axis (< -0.5): Move Left
   - D-pad Right (index 15) or Left Stick X axis (> 0.5): Move Right
   - D-pad Down (index 13) or Left Stick Y axis (> 0.5): Move Down
   - Button A (index 0 or 1 depending on layout, standard is B=0, A=1 but usually mapped as bottom=0, right=1. Let's map standard Gamepad buttons: B(bottom)=0 usually corresponds to A on joycon if mapped natively or we can just map the standard A/B/X/Y. Standard gamepad: 0=Bottom (A), 1=Right (B), 2=Left (X), 3=Top (Y)). Actually Joycon (Nintendo) layout is A (Right), B (Bottom), X (Top), Y (Left).
   Let's stick to standard gamepad API mapping for simplicity and generic support, but we need to map A (rotate), X (pause), Y (stash).
   Standard gamepad API buttons:
   - 0: Bottom button (A on Xbox, B on Nintendo)
   - 1: Right button (B on Xbox, A on Nintendo)
   - 2: Left button (X on Xbox, Y on Nintendo)
   - 3: Top button (Y on Xbox, X on Nintendo)
   Joycon mapped to standard gamepad usually preserves physical locations. So:
   - Right button (index 1) -> Rotate
   - Top button (index 3) -> Pause
   - Left button (index 2) -> Stash
   Actually, the prompt specifically says:
   - A maps to rotate
   - X maps to pause
   - Y maps to stash

   Let's map standard Gamepad API button indices based on a typical Joycon mapping:
   - Joycon A (Right physical button) = Gamepad API button 1 (or 0 if not remapped). We will check button 1 and button 0 to be safe or just standard mapping.
   Let's just use the standard Gamepad API indices:
   - Bottom button (index 0): usually B on Nintendo, A on Xbox.
   - Right button (index 1): usually A on Nintendo, B on Xbox. Let's map this to Rotate.
   - Top button (index 3): usually X on Nintendo, Y on Xbox. Let's map this to Pause.
   - Left button (index 2): usually Y on Nintendo, X on Xbox. Let's map this to Stash.
   - Let's actually map both (0 and 1) to rotate, (2 and 3) to stash/pause just to be robust, or we can just map specific indices based on standard Gamepad layout.
   Let's define standard mapping:
   - D-Pad Left (14) / Joystick Axis 0 < -0.5: Left
   - D-Pad Right (15) / Joystick Axis 0 > 0.5: Right
   - D-Pad Down (13) / Joystick Axis 1 > 0.5: Down
   - Rotate (Joycon A = Right button): Button 1 (and maybe 0 for good measure since A is bottom on Xbox) -> Rotate
   - Pause (Joycon X = Top button): Button 3 (Top button) -> Pause
   - Stash (Joycon Y = Left button): Button 2 (Left button) -> Stash

   To support continuous movement for left/right/down, we should use the same `startRepeat` and `clearRepeat` logic we have for keyboard/touch, OR just trigger them and use a cooldown in the `requestAnimationFrame` loop.
   Let's implement a `requestAnimationFrame` loop inside `app/tetris/page.tsx` that polls `navigator.getGamepads()`.

4. Update `app/tetris/page.tsx` with Gamepad polling.
