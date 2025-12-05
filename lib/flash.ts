import { createMiddleware } from "@hono/hono/factory";
import { AsyncLocalStorage } from "node:async_hooks";
import { FlashStore } from "./flash-store.class.ts";
import type { JSONValue } from "@hono/hono/utils/types";

/**
 * Options for configuring flash message behavior.
 */
export interface HonoldOptions {
  /**
   * Automatically reflash messages on redirect GET responses.
   */
  autoReflash?: boolean;
  /**
   * Name of the cookie used to store flash messages.
   */
  cookieName?: string;
}

/**
 * An instance of `AsyncLocalStorage` used to store and manage flash messages
 * within the current asynchronous context. This allows flash messages to be
 * scoped to the lifetime of a request or other async operations.
 *
 * @remarks
 * The store holds a `FlashStore` object, which contains the flash messages
 * relevant to the current execution context.
 */
const FLASH_RUNTIME_STORE = new AsyncLocalStorage<FlashStore>();

/**
 * Middleware factory that provides flash message support for requests.
 *
 * @param options - Configuration options for the flash middleware.
 * @param options.autoReflash - If true, automatically refreshes flash messages on GET redirects (default: true).
 * @param options.cookieName - The name of the cookie used to store flash messages (default: 'flash').
 * @returns A middleware function that attaches a `flash` store to the request context, manages its lifecycle,
 *          and optionally refreshes flash messages on redirects.
 *
 * @example
 * app.use(honold({ cookieName: 'myFlash', autoReflash: false }));
 */
export const honold: (
  honoldOptions?: HonoldOptions,
) => ReturnType<
  typeof createMiddleware<{
    Variables: {
      readonly flash: FlashStore;
    };
  }>
> = ({
  autoReflash = true,
  cookieName = "flash",
} = {}) =>
  createMiddleware(async (c, next) => {
    const store = new FlashStore(c, cookieName);
    c.set("flash", store);

    await FLASH_RUNTIME_STORE.run(store, next);

    if (
      autoReflash && c.res.status >= 300 && c.res.status < 400 &&
      c.req.method.toUpperCase() === "GET"
    ) {
      store.reflash();
    }
    store.commit();
  });

/**
 * Retrieves the current `FlashStore` instance from the runtime store.
 *
 * @throws {Error} If called outside of the `honold` middleware context, indicating that the `FlashStore` is unavailable.
 * @returns {FlashStore} The active flash store instance.
 */
export function getFlashStore(): FlashStore {
  const store = FLASH_RUNTIME_STORE.getStore();
  if (!store) {
    throw new Error(
      "FlashStore is not available outside of honold middleware.",
    );
  }
  return store;
}

/**
 * Triggers a flash effect on input elements by invoking the `flashInputs` method from the flash store.
 *
 * @returns {Promise<void>} A promise that resolves when the flash effect has been applied to the inputs.
 */
export async function flashInputs(): Promise<void> {
  const store = getFlashStore();
  await store.flashInputs();
}

/**
 * Stores a flash message or value in the flash store under the specified key.
 *
 * @param key - The key or array of keys under which the value should be stored.
 * @param value - The value to store, must be a valid JSON value.
 */
export function flash(key: string[] | string, value: JSONValue): void {
  const store = getFlashStore();
  store.flash(key, value);
}

/**
 * Refreshes the flash store with the specified options.
 *
 * @param options - Configuration options for the reflash operation.
 * @param options.append - If `true`, appends to the existing flash store; otherwise, replaces it. Defaults to `true`.
 * @param options.pick - Specifies which keys to pick from the flash store. Can be a string, array of strings, or array of string arrays.
 * @param options.except - Specifies which keys to omit from the flash store. Can be a string, array of strings, or array of string arrays.
 *
 * @returns void
 */
export function reflash({
  append = true,
  pick = undefined,
  except: omit = undefined,
}: {
  append?: boolean;
  pick?: string[][] | string[] | string;
  except?: string[][] | string[] | string;
}): void {
  const store = getFlashStore();
  store.reflash({ append, pick, omit });
}

/**
 * Retrieves a flash value from the flash store based on the provided filters.
 *
 * @param filters - A single filter string or an array of filter strings used to query the flash store.
 * @returns The value associated with the given filters as a `JSONValue`, or `undefined` if no value is found.
 */
export function getFlash(filters: string[] | string): JSONValue[] | undefined {
  const store = getFlashStore();
  return store.get(filters);
}
