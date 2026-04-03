// ============================================================================
// useLocalStorage — Typed localStorage hook with SSR safety
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Check whether we are running in a browser environment.
 * Returns false during SSR / server-side rendering.
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Read a value from localStorage, returning the parsed value or a fallback.
 */
function readFromStorage<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    // If the stored value is corrupted or not valid JSON, return the fallback
    console.warn(`[useLocalStorage] Failed to parse key "${key}", returning fallback.`);
    return fallback;
  }
}

/**
 * Write a value to localStorage.
 */
function writeToStorage<T>(key: string, value: T): void {
  if (!isBrowser()) return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    // Handle quota exceeded or private browsing errors gracefully
    console.warn(`[useLocalStorage] Failed to write key "${key}":`, err);
  }
}

/**
 * A typed hook for reading and writing values to localStorage.
 * SSR-safe: returns the initial value during server-side rendering
 * and hydrates from localStorage on mount.
 *
 * Automatically serializes/deserializes via JSON.
 * Listens for cross-tab `storage` events so all tabs stay in sync.
 *
 * @param key          - The localStorage key
 * @param initialValue - The fallback value when nothing is stored
 * @returns A tuple of [storedValue, setValue, removeValue]
 *
 * @example
 *   const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'dark');
 *   const [dismissed, setDismissed] = useLocalStorage<string[]>('dismissed-tips', []);
 *   const [_, __, removeSetting] = useLocalStorage('setting-key', defaultVal);
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Initialize state — read from storage on client, use initialValue on server
  const [storedValue, setStoredValue] = useState<T>(() =>
    readFromStorage(key, initialValue),
  );

  // Keep key ref stable to detect key changes
  const keyRef = useRef(key);

  // If the key changes, re-read from storage
  useEffect(() => {
    if (keyRef.current !== key) {
      keyRef.current = key;
      setStoredValue(readFromStorage(key, initialValue));
    }
  }, [key, initialValue]);

  // Hydrate on mount in case SSR rendered with initialValue
  // but localStorage has a different value
  useEffect(() => {
    const stored = readFromStorage(key, initialValue);
    setStoredValue(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Set a new value — accepts either a direct value or an updater function.
   * Persists to localStorage and updates React state.
   */
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const nextValue =
          value instanceof Function ? value(prev) : value;
        writeToStorage(key, nextValue);
        return nextValue;
      });
    },
    [key],
  );

  /**
   * Remove the value from localStorage and reset state to initialValue.
   */
  const removeValue = useCallback(() => {
    if (isBrowser()) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // Silently ignore removal errors
      }
    }
    setStoredValue(initialValue);
  }, [key, initialValue]);

  // Listen for cross-tab storage events to keep state in sync
  useEffect(() => {
    if (!isBrowser()) return;

    function handleStorageChange(event: StorageEvent) {
      if (event.key !== key) return;

      if (event.newValue === null) {
        // Key was removed in another tab
        setStoredValue(initialValue);
      } else {
        try {
          setStoredValue(JSON.parse(event.newValue) as T);
        } catch {
          setStoredValue(initialValue);
        }
      }
    }

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
