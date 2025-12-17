import React, { useState, useEffect } from 'react';

/**
 * usePersistedState - A custom hook for state that persists to localStorage
 * 
 * Similar to useState, but automatically syncs state with localStorage.
 * Reads initial value from localStorage on mount, and writes to localStorage on every state change.
 * Handles JSON serialization/deserialization and error cases gracefully.
 * 
 * @template T - The type of the state value
 * @param {string} key - The localStorage key to use for persistence
 * @param {T} initialValue - The initial value to use if no value exists in localStorage
 * @returns {[T, React.Dispatch<React.SetStateAction<T>>]} A tuple of [state, setState] similar to useState
 * 
 * @example
 * const [theme, setTheme] = usePersistedState<string>('app_theme', 'light');
 * // theme will be 'light' initially, or the value from localStorage if it exists
 * // setTheme('dark') will update state and localStorage
 */
export const usePersistedState = <T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Error writing localStorage key "${key}":`, error);
    }
  }, [key, state]);

  return [state, setState];
};
