import type { JSONValue } from "@hono/hono/utils/types";

/**
 * Represents a flash value that can be stored and retrieved.
 */
export interface FlashValue {
  /**
   * The key path associated with the flash value.
   */
  readonly key: string[];
  /**
   * The JSON value associated with the key path.
   */
  readonly value: JSONValue;
}

/**
 * Type guard that checks if a value is a FlashValue object.
 * @param value - The unknown value to check
 * @returns `true` if the value is a FlashValue object with a string array key and a value property, `false` otherwise
 */
export function isFlashValue(value: unknown): value is FlashValue {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const flashValue = value as FlashValue;
  if (
    !Array.isArray(flashValue.key) ||
    !flashValue.key.every((k) => typeof k === "string")
  ) {
    return false;
  }
  return "value" in flashValue;
}

/**
 * Represents the flash storage cookie value.
 */
export interface Flash {
  /**
   * An array of flash values stored in the flash object.
   */
  readonly values: FlashValue[];
  /**
   * Indicates whether there are any valid flash messages.
   * @returns `true` if there are valid flash messages, `false` otherwise.
   *
   * @remarks
   * `false` indicates that the object does not stem from a valid flash message source.
   */
  readonly valid: boolean;
}

/**
 * Determines whether the provided value is a valid `Flash` object.
 *
 * This function performs a type guard check to verify that the input is an object
 * with a `values` property that is an array of valid `FlashValue` elements (as determined
 * by the `isFlashValue` function), and a `valid` property of type boolean.
 *
 * @param value - The value to check.
 * @returns `true` if the value is a `Flash` object, otherwise `false`.
 */
export function isFlash(value: unknown): value is Flash {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const flash = value as Flash;
  if (!Array.isArray(flash.values) || !flash.values.every(isFlashValue)) {
    return false;
  }
  return typeof flash.valid === "boolean";
}
