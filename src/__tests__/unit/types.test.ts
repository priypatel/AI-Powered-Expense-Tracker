import { CATEGORIES, CATEGORY_COLORS } from "@/types";
import type { Category } from "@/types";

describe("CATEGORIES", () => {
  test("has exactly 10 items", () => {
    expect(CATEGORIES).toHaveLength(10);
  });

  test("contains all required category values", () => {
    expect(CATEGORIES).toContain("Food");
    expect(CATEGORIES).toContain("Transport");
    expect(CATEGORIES).toContain("Shopping");
    expect(CATEGORIES).toContain("Entertainment");
    expect(CATEGORIES).toContain("Health");
    expect(CATEGORIES).toContain("Utilities");
    expect(CATEGORIES).toContain("Housing");
    expect(CATEGORIES).toContain("Education");
    expect(CATEGORIES).toContain("Travel");
    expect(CATEGORIES).toContain("Other");
  });

  test("all items are non-empty strings", () => {
    CATEGORIES.forEach((c) => {
      expect(typeof c).toBe("string");
      expect(c.length).toBeGreaterThan(0);
    });
  });

  test("is defined as a tuple (as const) — readonly at type level", () => {
    // as const provides TypeScript-level readonly; the runtime array is still a valid array
    expect(Array.isArray(CATEGORIES)).toBe(true);
  });

  test("has no duplicate values", () => {
    const unique = new Set(CATEGORIES);
    expect(unique.size).toBe(CATEGORIES.length);
  });
});

describe("CATEGORY_COLORS", () => {
  test("has a color entry for every category", () => {
    CATEGORIES.forEach((category) => {
      expect(CATEGORY_COLORS).toHaveProperty(category);
    });
  });

  test("all color values are non-empty strings", () => {
    Object.values(CATEGORY_COLORS).forEach((color) => {
      expect(typeof color).toBe("string");
      expect(color.length).toBeGreaterThan(0);
    });
  });

  test("all color values are valid hex color codes", () => {
    const hexColorRegex = /^#[0-9a-f]{6}$/i;
    Object.values(CATEGORY_COLORS).forEach((color) => {
      expect(color).toMatch(hexColorRegex);
    });
  });

  test("has exactly 10 color entries", () => {
    expect(Object.keys(CATEGORY_COLORS)).toHaveLength(10);
  });
});

describe("Category type", () => {
  test("Category type accepts valid category strings", () => {
    const validCategory: Category = "Food";
    expect(CATEGORIES).toContain(validCategory);
  });
});
