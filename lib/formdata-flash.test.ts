import { describe, it } from "@std/testing/bdd";
import { serializeFormData } from "./formdata-flash.ts";
import { expect } from "@std/expect";

describe("serializeFormData", () => {
  it("should serialize single key-value pairs", () => {
    const formData = new FormData();
    formData.append("name", "Alice");
    const result = serializeFormData(formData);
    expect(result).toEqual({ name: ["Alice"] });
  });

  it("should serialize multiple values for the same key", () => {
    const formData = new FormData();
    formData.append("colors", "red");
    formData.append("colors", "blue");
    const result = serializeFormData(formData);
    expect(result).toEqual({ colors: ["red", "blue"] });
  });

  it("should ignore non-string values (e.g., File)", () => {
    const formData = new FormData();
    formData.append("file", new Blob(["test"], { type: "text/plain" }));
    formData.append("text", "hello");
    const result = serializeFormData(formData);
    expect(result).toEqual({ text: ["hello"] });
  });

  it("should handle empty FormData", () => {
    const formData = new FormData();
    const result = serializeFormData(formData);
    expect(result).toEqual({});
  });

  it("should serialize multiple keys with multiple values", () => {
    const formData = new FormData();
    formData.append("a", "1");
    formData.append("a", "2");
    formData.append("b", "x");
    formData.append("b", "y");
    const result = serializeFormData(formData);
    expect(result).toEqual({ a: ["1", "2"], b: ["x", "y"] });
  });
});
