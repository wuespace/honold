/**
 * Serializes a FormData object into a plain object where each key maps to an array of string values.
 *
 * This function iterates over all entries in the provided FormData instance and collects values for each key.
 * If a key appears multiple times, all its string values are included in the resulting array.
 * Non-string values are ignored.
 *
 * @param formData - The FormData object to serialize.
 * @returns An object mapping each form field name to an array of its string values.
 */
export function serializeFormData(
  formData: FormData,
): Record<string, string[]> {
  const obj: Record<string, string[]> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value !== "string") {
      continue;
    }
    if (!obj[key]) {
      obj[key] = [];
    }
    obj[key].push(value);
  }
  return obj;
}

/**
 * Deserializes an object containing string arrays into a FormData instance.
 *
 * Each key in the input object represents a form field name, and its associated array contains
 * the values for that field. All values are appended to the resulting FormData under their respective keys.
 *
 * @param data - An object where each key is a form field name and its value is an array of strings to be appended.
 * @returns A FormData instance populated with the provided key-value pairs.
 */
export function deserializeFormData(data: Record<string, string[]>): FormData {
  const formData = new FormData();
  for (const key in data) {
    for (const value of data[key]) {
      formData.append(key, value);
    }
  }
  return formData;
}
