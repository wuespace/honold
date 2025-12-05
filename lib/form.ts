import { old, oldChecked, oldSelected } from "./old.ts";

/**
 * Generates standard HTML text input properties for form elements.
 * @param name - The name and id attribute for the input element
 * @param defaultValue - The default value if no old value exists (defaults to empty string)
 * @returns An object containing type, name, id, and value properties for a text input element
 */
export function textInputProps(
  name: string,
  defaultValue: string = "",
): { type: string; name: string; id: string; value: string } {
  return {
    type: "text",
    name,
    id: name,
    value: old(name) ?? defaultValue,
  };
}

/**
 * Generates props for a checkbox input element, including its type, name, id, and checked state.
 *
 * @param name - The name and id to assign to the checkbox input.
 * @param defaultIsChecked - Optional. The default checked state if no previous value is found. Defaults to `false`.
 * @returns An object containing the checkbox input properties: `type`, `name`, `id`, and `checked`.
 */
export function checkboxInputProps(
  name: string,
  defaultIsChecked: boolean = false,
): { type: string; name: string; id: string; checked: boolean } {
  return {
    type: "checkbox",
    name,
    id: name,
    checked: oldChecked(name) ?? defaultIsChecked,
  };
}

/**
 * Generates props for a checkbox input within a group, including type, name, id, value, and checked state.
 *
 * @param name - The name attribute for the checkbox group.
 * @param value - The value attribute for the individual checkbox.
 * @param defaultIsChecked - Optional. The default checked state if no previous selection exists. Defaults to `false`.
 * @returns An object containing the checkbox input properties: type, name, id, value, and checked.
 */
export function checkboxGroupInputProps(
  name: string,
  value: string,
  defaultIsChecked: boolean = false,
): { type: string; name: string; id: string; value: string; checked: boolean } {
  return {
    type: "checkbox",
    name,
    id: `${name}-${value}`,
    value,
    checked: oldSelected(name, value) ?? defaultIsChecked,
  };
}

/**
 * Generates props for a form input element, including `name` and `id` attributes.
 *
 * @param name - The name to assign to the input element.
 * @returns An object containing the `name` and `id` properties, both set to the provided name.
 */
export function selectInputProps(name: string): { name: string; id: string } {
  return {
    name,
    id: name,
  };
}

/**
 * Generates props for an option element, including its value, id, and selected state.
 *
 * @param name - The name of the option group, used to generate a unique id.
 * @param value - The value of the option.
 * @param defaultIsSelected - Whether the option should be selected by default if no previous selection exists. Defaults to `false`.
 * @returns An object containing the option's value, a unique id, and its selected state.
 */
export function selectOptionProps(
  name: string,
  value: string,
  defaultIsSelected: boolean = false,
): { value: string; id: string; selected: boolean } {
  return {
    value,
    id: `${name}-option-${value}`,
    selected: oldSelected(name, value) ?? defaultIsSelected,
  };
}

/**
 * Generates props for a textarea element, including `name`, `id`, and `value`.
 *
 * The `value` is determined by calling `old(name)`, which retrieves a previously entered value
 * (e.g., from form resubmission), or falls back to the provided `defaultValue` if none exists.
 *
 * @param name - The name and id to assign to the textarea.
 * @param defaultValue - The default value for the textarea if no previous value exists. Defaults to an empty string.
 * @returns An object containing `name`, `id`, and `value` properties for the textarea.
 */
export function textareaProps(
  name: string,
  defaultValue: string = "",
): { name: string; id: string; value: string } {
  return {
    name,
    id: name,
    value: old(name) ?? defaultValue,
  };
}
