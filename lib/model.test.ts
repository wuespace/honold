import { describe, it } from "@std/testing/bdd";
import { isFlashValue } from "./model.ts";
import { expect } from "@std/expect";
import { isFlash } from "./model.ts";

describe("isFlashValue", () => {
  it("returns true for valid FlashValue object", () => {
    const value = { key: ["foo", "bar"], value: 123 };
    expect(isFlashValue(value)).toBe(true);
  });

  it("returns false if value is null", () => {
    expect(isFlashValue(null)).toBe(false);
  });

  it("returns false if value is not an object", () => {
    expect(isFlashValue("string")).toBe(false);
    expect(isFlashValue(42)).toBe(false);
    expect(isFlashValue(undefined)).toBe(false);
    expect(isFlashValue(true)).toBe(false);
  });

  it("returns false if key is missing", () => {
    const value = { value: "test" };
    expect(isFlashValue(value)).toBe(false);
  });

  it("returns false if key is not an array", () => {
    const value = { key: "not-an-array", value: "test" };
    expect(isFlashValue(value)).toBe(false);
  });

  it("returns false if key array contains non-string elements", () => {
    const value = { key: ["foo", 123], value: "test" };
    expect(isFlashValue(value)).toBe(false);
  });

  it("returns false if value property is missing", () => {
    const value = { key: ["foo", "bar"] };
    expect(isFlashValue(value)).toBe(false);
  });

  it("returns true if value is undefined but property exists", () => {
    const value = { key: ["foo"], value: undefined };
    expect(isFlashValue(value)).toBe(true);
  });

  it("returns true for empty key array", () => {
    const value = { key: [], value: "test" };
    expect(isFlashValue(value)).toBe(true);
  });
});

describe("isFlash", () => {
  it("returns true for valid Flash object", () => {
    const value = {
      values: [{ key: ["foo"], value: 123 }],
      valid: true,
    };
    expect(isFlash(value)).toBe(true);
  });

  it("returns false if value is null", () => {
    expect(isFlash(null)).toBe(false);
  });

  it("returns false if value is not an object", () => {
    expect(isFlash("string")).toBe(false);
    expect(isFlash(42)).toBe(false);
    expect(isFlash(undefined)).toBe(false);
    expect(isFlash(true)).toBe(false);
  });

  it("returns false if values property is missing", () => {
    const value = { valid: true };
    expect(isFlash(value)).toBe(false);
  });

  it("returns false if values is not an array", () => {
    const value = { values: "not-an-array", valid: true };
    expect(isFlash(value)).toBe(false);
  });

  it("returns false if values array contains non-FlashValue elements", () => {
    const value = {
      values: [{ key: ["foo"], value: 123 }, {
        key: "not-an-array",
        value: "test",
      }],
      valid: true,
    };
    expect(isFlash(value)).toBe(false);
  });

  it("returns false if valid property is missing", () => {
    const value = { values: [{ key: ["foo"], value: 123 }] };
    expect(isFlash(value)).toBe(false);
  });

  it("returns false if valid is not a boolean", () => {
    const value = { values: [{ key: ["foo"], value: 123 }], valid: "true" };
    expect(isFlash(value)).toBe(false);
  });

  it("returns true for empty values array and valid boolean", () => {
    const value = { values: [], valid: false };
    expect(isFlash(value)).toBe(true);
  });
});
