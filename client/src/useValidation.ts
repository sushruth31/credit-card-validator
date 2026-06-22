import { useEffect, useState } from 'react';
import { validateCard } from './api/cardValidator';
import { UI } from './constants';
import type { ValidationResponse } from '@ccv/shared';

/**
 * Runs `task` after `delay` and cancels on cleanup. `isCurrent()` turns false
 * once the effect is torn down, which is how a reply arriving after the next
 * keystroke is dropped instead of overwriting a newer verdict.
 */
const debounceEffect = (delay: number, task: (isCurrent: () => boolean) => void) => {
  let current = true;
  const timer = setTimeout(() => task(() => current), delay);
  return () => {
    current = false;
    clearTimeout(timer);
  };
};

/** Validates the card number on the backend, debounced as the user types. */
export const useValidation = (digits: string) => {
  const [result, setResult] = useState<ValidationResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!digits) {
      setResult(null);
      return;
    }
    setLoading(true);
    return debounceEffect(UI.DEBOUNCE_MS, async (isCurrent) => {
      const verdict = await validateCard(digits);
      if (!isCurrent()) return;
      setResult(verdict);
      setLoading(false);
    });
  }, [digits]);

  return { result, loading };
};
