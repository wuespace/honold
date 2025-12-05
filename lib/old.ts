import { getFlashStore } from "./flash.ts";

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

export function oldChecked(name: string): boolean | undefined {
  const store = getFlashStore();
  const fd = store.getInputs();
  if (!fd) {
    return;
  }
  const value = fd.get(name);
  if (value === null) {
    return;
  }
  return Boolean(value);
}

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
  if (value === null) {
    return;
  }
  return value.includes(optionValue);
}
