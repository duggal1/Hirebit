// File: /lib/hooks/useActionState.ts

import { useState, useCallback } from "react";

/**
 * A custom hook to manage action state.
 * 
 * @param action A function that receives the current state and a payload,
 *               and returns the new state (or a promise that resolves to the new state).
 * @param initialState The initial state value.
 * @returns A tuple containing the current state and a function to run the action.
 */
export function useActionState<S, P>(
  action: (prevState: S, payload: P) => S | Promise<S>,
  initialState: S
): [S, (payload: P) => Promise<void>] {
  const [state, setState] = useState<S>(initialState);

  const runAction = useCallback(async (payload: P) => {
    try {
      // Call the action with the current state and payload.
      const newState = await action(state, payload);
      setState(newState);
    } catch (error) {
      console.error("Error running action:", error);
      // Optionally, you might want to set error state here or rethrow.
    }
  }, [action, state]);

  return [state, runAction];
}
