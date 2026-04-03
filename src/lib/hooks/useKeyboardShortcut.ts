// ============================================================================
// useKeyboardShortcut — Hook for declarative keyboard shortcut binding
// ============================================================================

import { useEffect, useCallback, useRef } from 'react';

/**
 * Modifier keys supported in key combo strings.
 * Combos use '+' as separator, e.g. 'cmd+k', 'cmd+shift+f', 'ctrl+alt+d'.
 *
 * Modifier mapping:
 *   'cmd'   / 'meta'  -> metaKey  (Mac Command, Windows key)
 *   'ctrl'  / 'control' -> ctrlKey
 *   'shift' -> shiftKey
 *   'alt'   / 'option'  -> altKey
 */

interface ParsedShortcut {
  key: string;
  meta: boolean;
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
}

/**
 * Parse a human-readable key combo string into its constituent parts.
 *
 * @example
 *   parseCombo('cmd+k')         -> { key: 'k', meta: true, ... }
 *   parseCombo('cmd+shift+f')   -> { key: 'f', meta: true, shift: true, ... }
 *   parseCombo('ctrl+alt+d')    -> { key: 'd', ctrl: true, alt: true, ... }
 *   parseCombo('Escape')        -> { key: 'escape', ... }
 */
function parseCombo(combo: string): ParsedShortcut {
  const parts = combo.toLowerCase().split('+').map((p) => p.trim());

  const modifiers = {
    meta: false,
    ctrl: false,
    shift: false,
    alt: false,
  };

  let key = '';

  for (const part of parts) {
    switch (part) {
      case 'cmd':
      case 'meta':
      case 'command':
        modifiers.meta = true;
        break;
      case 'ctrl':
      case 'control':
        modifiers.ctrl = true;
        break;
      case 'shift':
        modifiers.shift = true;
        break;
      case 'alt':
      case 'option':
        modifiers.alt = true;
        break;
      default:
        key = part;
    }
  }

  return { key, ...modifiers };
}

/**
 * Check whether a keyboard event matches a parsed shortcut.
 */
function matchesShortcut(event: KeyboardEvent, shortcut: ParsedShortcut): boolean {
  if (event.key.toLowerCase() !== shortcut.key) return false;
  if (event.metaKey !== shortcut.meta) return false;
  if (event.ctrlKey !== shortcut.ctrl) return false;
  if (event.shiftKey !== shortcut.shift) return false;
  if (event.altKey !== shortcut.alt) return false;
  return true;
}

/**
 * Hook that binds a keyboard shortcut to a callback.
 * Automatically cleans up on unmount.
 *
 * @param combo    - Key combo string, e.g. 'cmd+k', 'cmd+shift+f', 'Escape'
 * @param callback - Function to call when the shortcut is triggered
 * @param options  - Optional configuration
 *   - enabled:         Whether the shortcut is active (default: true)
 *   - preventDefault:  Whether to call event.preventDefault() (default: true)
 *   - allowInInput:    Whether to fire when focus is inside an input/textarea (default: false)
 *
 * @example
 *   useKeyboardShortcut('cmd+k', () => setCommandBarOpen(true));
 *   useKeyboardShortcut('Escape', () => closePanel(), { allowInInput: true });
 */
export function useKeyboardShortcut(
  combo: string,
  callback: (event: KeyboardEvent) => void,
  options: {
    enabled?: boolean;
    preventDefault?: boolean;
    allowInInput?: boolean;
  } = {},
): void {
  const {
    enabled = true,
    preventDefault = true,
    allowInInput = false,
  } = options;

  // Keep callback ref stable to avoid re-registering listeners on every render
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const shortcut = parseCombo(combo);

  const handler = useCallback(
    (event: KeyboardEvent) => {
      // Skip if firing inside input/textarea/contenteditable unless explicitly allowed
      if (!allowInInput) {
        const target = event.target as HTMLElement;
        const tag = target.tagName.toLowerCase();
        if (
          tag === 'input' ||
          tag === 'textarea' ||
          tag === 'select' ||
          target.isContentEditable
        ) {
          return;
        }
      }

      if (matchesShortcut(event, shortcut)) {
        if (preventDefault) {
          event.preventDefault();
        }
        callbackRef.current(event);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [shortcut.key, shortcut.meta, shortcut.ctrl, shortcut.shift, shortcut.alt, preventDefault, allowInInput],
  );

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
    };
  }, [enabled, handler]);
}
