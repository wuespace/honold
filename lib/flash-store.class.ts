import type { Context } from "@hono/hono";
import { deleteCookie, setCookie } from "@hono/hono/cookie";
import { type Flash, type FlashValue, isFlash } from "./model.ts";
import { deserializeFormData, serializeFormData } from "./formdata-flash.ts";

/**
 * A flash store implementation for managing temporary message data across requests.
 *
 * FlashStore provides a mechanism to store and retrieve flash messages that persist
 * for a single request cycle. Messages can be added, retrieved with optional filtering,
 * and committed to a cookie for use in the next request.
 *
 * @example
 * ```typescript
 * const flashStore = new FlashStore(context, 'flash');
 * flashStore.add('success', 'Operation completed');
 * flashStore.add(['form', 'errors'], 'Validation failed');
 *
 * // Retrieve all flash messages
 * const allMessages = flashStore.get();
 *
 * // Retrieve specific messages by key path
 * const successMessages = flashStore.get('success');
 * const formErrors = flashStore.get(['form', 'errors']);
 *
 * // Reflash messages for the next request
 * flashStore.reflash({ pick: 'errors' });
 * flashStore.commit();
 * ```
 *
 * @remarks
 * - Current flash data is loaded from a cookie during initialization and then deleted.
 * - New messages are stored in the `next` flash store.
 * - The `reflash()` method allows carrying forward messages to the next request.
 * - `commit()` must be called to persist the next flash store to a cookie.
 */
export class FlashStore {
  /**
   * Holds the currently active {@link Flash} instance.
   * This property is used to track the flash object that is currently in use.
   */
  private current: Flash;
  /**
   * Holds the next {@link Flash} instance to be committed.
   * This property is used to store the flash object that will be saved for the next request.
   */
  private next: Flash = { valid: false, values: [] };

  /**
   * Creates an instance of the FlashStore class.
   *
   * @param context - The current request context, used for accessing session or request-specific data.
   * @param cookieName - The name of the cookie used to store flash data.
   */
  constructor(
    private readonly context: Context,
    private readonly cookieName: string,
  ) {
    this.current = this.initialize();
  }

  /**
   * Initializes the flash store by retrieving and parsing the flash cookie.
   *
   * Deletes the flash cookie from the context and attempts to parse its value.
   * Validates that the parsed value conforms to the Flash interface.
   *
   * @returns A Flash object containing the parsed values if valid, otherwise an invalid Flash object with empty values.
   */
  private initialize(): Flash {
    const rawCookieValue = deleteCookie(this.context, this.cookieName);
    if (!rawCookieValue) {
      return { valid: false, values: [] };
    }
    try {
      const parsed: unknown = JSON.parse(rawCookieValue);
      if (!isFlash(parsed)) {
        return { valid: false, values: [] };
      }
      return parsed;
    } catch {
      return { valid: false, values: [] };
    }
  }

  /**
   * Stores a flash message for the next request cycle.
   * @param key the key for which to store the value
   * @param value the value to flash
   */
  flash(key: string[] | string, value: Flash["values"][number]["value"]): void {
    key = [key].flat();
    this.next = {
      valid: true,
      values: [...this.next.values, { key: ["ext", ...key], value }],
    };
  }

  /**
   * Flashes the current request's form data inputs to the next flash store.
   *
   * Similar to Laravel's `withInput()`, this method serializes the form data from the current request
   * and adds it to the next flash store under the key 'inputs'.
   */
  async flashInputs(): Promise<void> {
    const formData = await this.context.req.formData();
    const serialized = serializeFormData(formData);
    this.next = {
      valid: true,
      values: [...this.next.values, { key: ["inputs"], value: serialized }],
    };
  }

  /**
   * Retrieves the deserialized form data inputs from the current valid form state.
   *
   * @returns {FormData | undefined} The deserialized form data if available and the current form is valid,
   * otherwise undefined.
   */
  getInputs(): FormData | undefined {
    if (!this.current.valid) {
      return;
    }
    const inputValues = this.current.values.find(({ key }) =>
      key.length === 1 && key[0] === "inputs"
    );
    if (!inputValues) {
      return;
    }

    return deserializeFormData(inputValues.value as Record<string, string[]>);
  }

  /**
   * Retrieves values from the store, optionally filtered by key path.
   * @param keyFilter - Optional key filter(s) to match against stored keys. Can be a string, array of strings, or undefined.
   *                    If undefined, returns all current values.
   *                    If provided, returns values whose keys match the filter path.
   * @returns All current values if no filter provided, or an array of values matching the key filter.
   */
  get(): Flash;
  get(keyFilter: string[] | string): Flash["values"][number]["value"][];
  get(keyFilter?: string[] | string | undefined) {
    if (keyFilter === undefined) {
      return this.current;
    }
    keyFilter = ["ext", ...[keyFilter].flat()];
    return this.current.values
      .filter(({ key }) =>
        keyFilter.every((k, i) => key.length > i && key[i] === k)
      )
      .map(({ value }) => value);
  }

  /**
   * Updates the `next` values based on the current values and specified options.
   *
   * @param options - The options for updating the values.
   * @param options.append - If true, appends the new values to the existing ones. Overwrites if `false`. Defaults to true.
   * @param options.omit - Specifies values to omit from the update. Can be a string, an array of strings, or an array of arrays of strings.
   * @param options.pick - Specifies values to include in the update. Can be a string, an array of strings, or an array of arrays of strings.
   *
   * @returns void
   */
  reflash({
    append = true,
    omit = [],
    pick = [],
  }: {
    append?: boolean;
    omit?: string[][] | string[] | string;
    pick?: string[][] | string[] | string;
  } = {}): void {
    const valuesToReflash = this.filterFlashValues(
      this.current.values,
      pick,
      omit,
    );

    if (append) {
      this.next = {
        valid: true,
        values: [...this.next.values, ...valuesToReflash],
      };
      return;
    }

    this.next = {
      valid: true,
      values: valuesToReflash,
    };
  }
  /**
   * Filters an array of FlashValue objects based on specified inclusion and exclusion criteria.
   *
   * @param values - An array of FlashValue objects to be filtered.
   * @param pick - A string, an array of strings, or an array of arrays of strings representing the keys to include.
   * @param omit - A string, an array of strings, or an array of arrays of strings representing the keys to exclude.
   * @returns An array of FlashValue objects that match the inclusion and exclusion criteria.
   */
  private filterFlashValues(
    values: FlashValue[],
    pick: string | string[] | string[][],
    omit: string | string[] | string[][],
  ) {
    return values.filter(({ key }) => {
      if (pick.length > 0 && !this.checkKeyAgainstFilters(key, pick)) {
        return false;
      }
      if (omit.length > 0 && this.checkKeyAgainstFilters(key, omit)) {
        return false;
      }
      return true;
    });
  }

  /**
   * Normalizes the provided filters by ensuring they are in a consistent array format.
   *
   * This method takes a single string, an array of strings, or a nested array of strings,
   * and flattens it into a two-dimensional array. Each filter is wrapped in an array to
   * ensure uniformity in the output structure.
   *
   * @param filters - A string, an array of strings, or a nested array of strings to be normalized.
   * @returns A two-dimensional array containing the normalized filters.
   *
   * @example
   * normalizeFilters('key1')
   * // Returns: [['key1']]
   *
   * normalizeFilters(['key1', 'key2'])
   * // Returns: [['key1', 'key2']]
   *
   * normalizeFilters([['key1', 'subkey1'], ['key2', 'subkey2']])
   * // Returns: [['key1', 'subkey1'], ['key2', 'subkey2']]
   */
  private normalizeFilters(
    filters: string | string[] | string[][],
  ): string[][] {
    if (typeof filters === "string") {
      // single filter
      return [[filters]];
    }

    if (
      Array.isArray(filters) && filters.length > 0 && Array.isArray(filters[0])
    ) {
      // array of filters
      return filters as string[][];
    }

    if (filters.length === 0) {
      // empty filters
      return [];
    }

    // single array filter
    return [filters as string[]];
  }

  /**
   * Checks if a key matches against one or more filter patterns.
   * @param key - The key path to check, as an array of string segments.
   * @param filter - The filter pattern(s) to match against. Can be a single string, an array of strings, or a 2D array of string arrays.
   * @returns `true` if the key matches any of the filter patterns, `false` otherwise.
   */
  private checkKeyAgainstFilters(
    key: string[],
    filter: string[][] | string[] | string,
  ): boolean {
    const filters = this.normalizeFilters(filter);
    return filters.some((f) =>
      f.every((part, i) => key.length > i && key[i] === part)
    );
  }

  /**
   * Commits the current flash data to a cookie if valid.
   * Serializes the next flash data object to JSON and stores it in a cookie
   * with the configured cookie name and root path.
   *
   * @remarks
   * This method only proceeds if {@link next.valid} is true.
   * If validation fails, the method returns early without setting the cookie.
   */
  commit(): void {
    if (!this.next.valid) {
      return;
    }
    const flashData = JSON.stringify(this.next);
    setCookie(this.context, this.cookieName, flashData, { path: "/" });
  }
}
