import { validateExpenseBody } from "@/lib/validators";

describe("validateExpenseBody", () => {
  test("returns parsed data for valid input", () => {
    const result = validateExpenseBody({
      amount: 150,
      category: "Food",
      date: "2024-01-15",
      note: "Lunch",
    });
    expect("error" in result).toBe(false);
    if ("error" in result) return;
    expect(result.amount).toBe(150);
    expect(result.category).toBe("Food");
    expect(result.date).toBeInstanceOf(Date);
    expect(result.note).toBe("Lunch");
  });

  test("returns error for amount = 0", () => {
    const result = validateExpenseBody({ amount: 0, category: "Food", date: "2024-01-15" });
    expect("error" in result).toBe(true);
    if (!("error" in result)) return;
    expect(result.error).toMatch(/positive/i);
  });

  test("returns error for negative amount", () => {
    const result = validateExpenseBody({ amount: -10, category: "Food", date: "2024-01-15" });
    expect("error" in result).toBe(true);
    if (!("error" in result)) return;
    expect(result.error).toMatch(/positive/i);
  });

  test("returns error for invalid category", () => {
    const result = validateExpenseBody({ amount: 100, category: "Gambling", date: "2024-01-15" });
    expect("error" in result).toBe(true);
    if (!("error" in result)) return;
    expect(result.error).toMatch(/category/i);
  });

  test("returns error for missing amount", () => {
    const result = validateExpenseBody({ category: "Food", date: "2024-01-15" });
    expect("error" in result).toBe(true);
    if (!("error" in result)) return;
    expect(result.error).toMatch(/amount/i);
  });

  test("returns error for missing category", () => {
    const result = validateExpenseBody({ amount: 100, date: "2024-01-15" });
    expect("error" in result).toBe(true);
    if (!("error" in result)) return;
    expect(result.error).toMatch(/category/i);
  });

  test("returns error for invalid date string", () => {
    const result = validateExpenseBody({ amount: 100, category: "Food", date: "not-a-date" });
    expect("error" in result).toBe(true);
    if (!("error" in result)) return;
    expect(result.error).toMatch(/date/i);
  });

  test("trims and normalizes valid date", () => {
    const result = validateExpenseBody({
      amount: 100,
      category: "Food",
      date: "2024-06-15T10:30:00.000Z",
    });
    expect("error" in result).toBe(false);
    if ("error" in result) return;
    expect(result.date).toBeInstanceOf(Date);
    expect(result.date.getFullYear()).toBe(2024);
  });

  test("note is optional — valid without note field", () => {
    const result = validateExpenseBody({ amount: 50, category: "Transport", date: "2024-03-10" });
    expect("error" in result).toBe(false);
    if ("error" in result) return;
    expect(result.note).toBeUndefined();
  });
});
