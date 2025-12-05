import { getFlashStore } from "./flash.ts";

/**
 * Retrieves a string value from the flash store inputs.
 * @param name - The name of the input to retrieve
 * @returns The string value associated with the input name, or undefined if not found or if inputs are unavailable
 */
export function old(name: string): string | undefined {
  const store = getFlashStore();
  const fd = store.getInputs();
  if (!fd) {
    return;
  }
  const value = fd.get(name);
  if (value === null) {
    return;
  }
  return value as string;
}

/**
 * Checks if an input field exists in the flash store.
 * @param name - The name of the input field to check
 * @returns `true` if the input field exists, `false` if it doesn't, or `undefined` if the flash store has no inputs
 */
export function oldChecked(name: string): boolean | undefined {
  const store = getFlashStore();
  const fd = store.getInputs();
  if (!fd) {
    return;
  }
  return fd.has(name);
}

/**
 * Checks if an option value is selected for a given form input name.
 * @param name - The name of the form input field
 * @param optionValue - The option value to check for selection
 * @returns True if the option value is included in the selected values, false if not, or undefined if no input data is available
 */
export function oldSelected(
  name: string,
  optionValue: string,
): boolean | undefined {
  const store = getFlashStore();
  const fd = store.getInputs();
  if (!fd) {
    return;
  }
  const value = fd.getAll(name);
  return value.includes(optionValue);
}
