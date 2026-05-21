# PROMPTS.md — AI Prompt Engineering Reference

## Overview
This file documents every prompt used with Google Gemini 1.5 Flash in this project.
Each prompt includes: the template, rationale, example input/output, and failure modes.

---

## Prompt 1: Expense Extraction from Raw Text

### Location
`src/lib/gemini.ts` → `extractExpenseFromText()`

### Purpose
Convert unstructured user text (bill, SMS, receipt, voice note) into structured expense fields:
`amount`, `category`, `date`, `note`.

### Prompt Template

```
You are an expense extraction assistant. From the following text, extract:
- amount (number only, no currency symbol, e.g. 45.50)
- category (must be exactly one of: Food, Transport, Shopping, Entertainment, Health, Utilities, Housing, Education, Travel, Other)
- date (ISO 8601 format YYYY-MM-DD; infer from context, or use today's date ${TODAY} if not mentioned)
- note (short description of what the expense was, max 80 characters)

Rules:
1. Respond ONLY with a single valid JSON object. No explanation, no markdown, no code block.
2. If you cannot determine the amount, set amount to null.
3. If the category is ambiguous, choose the closest match or "Other".
4. Do not include a currency symbol in the amount field.

Example response format:
{"amount": 45.50, "category": "Food", "date": "2026-05-21", "note": "Lunch at Subway"}

Text:
"""
${USER_TEXT}
"""
```

### Design Rationale
- **"Respond ONLY with JSON"** — prevents Gemini from wrapping the response in markdown code blocks or adding explanation, which breaks `JSON.parse()`.
- **Category enum listed explicitly** — constrains Gemini's output to valid values; avoids variations like "Groceries" or "Dining" that aren't in our schema.
- **Today's date injected** — removes ambiguity for "yesterday" or "last Tuesday" references.
- **`amount: null` fallback rule** — allows graceful handling when amount can't be determined, so frontend can show an empty field rather than a wrong value.
- **Max 80 chars for note** — prevents overly verbose descriptions that clutter the UI.

---

### Example 1 — Receipt text
**Input:**
```
McDonald's
Date: 21 May 2026
Big Mac Meal         ₹350
Coke                  ₹80
Total:               ₹430
Thank you for visiting!
```

**Expected Output:**
```json
{"amount": 430, "category": "Food", "date": "2026-05-21", "note": "McDonald's meal"}
```

---

### Example 2 — SMS
**Input:**
```
Your A/C XX1234 is debited INR 1,250.00 on 20-May-26 at UBER INDIA. Avl Bal: INR 45,230.00
```

**Expected Output:**
```json
{"amount": 1250, "category": "Transport", "date": "2026-05-20", "note": "Uber ride"}
```

---

### Example 3 — Casual note
**Input:**
```
paid netflix subscription 649 bucks
```

**Expected Output:**
```json
{"amount": 649, "category": "Entertainment", "date": "2026-05-21", "note": "Netflix subscription"}
```
*(date defaults to today since not specified)*

---

### Example 4 — Ambiguous category
**Input:**
```
Bought new laptop bag from Amazon for 1899
```

**Expected Output:**
```json
{"amount": 1899, "category": "Shopping", "date": "2026-05-21", "note": "Laptop bag from Amazon"}
```

---

### Example 5 — No amount detectable
**Input:**
```
Went to the doctor today
```

**Expected Output:**
```json
{"amount": null, "category": "Health", "date": "2026-05-21", "note": "Doctor visit"}
```
*(Frontend shows empty amount field, user fills in manually)*

---

## Failure Modes & Handling

| Failure | Cause | Handling in Code |
|---|---|---|
| Malformed JSON | Gemini adds markdown ` ```json ``` ` wrapper | Strip ` ``` ` blocks before `JSON.parse()` |
| Wrong category value | Gemini hallucinates a new category | Validate against `CATEGORIES` enum; fallback to `"Other"` |
| Amount with currency symbol | Gemini returns "₹430" not 430 | Strip non-numeric chars (except `.`) with regex |
| API rate limit (429) | Too many requests | Catch error, return `{ error: "AI temporarily unavailable" }` |
| Network timeout | Gemini API unreachable | Set 10s timeout; catch; return `{ error: "AI extraction failed" }` |
| API key invalid | Wrong/missing env var | Catch `GoogleGenerativeAIError`; return `{ error: "AI service misconfigured" }` |

---

## Post-Processing Logic (in `src/lib/gemini.ts`)

```typescript
// After receiving Gemini response text:

// 1. Strip markdown code blocks if present
const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

// 2. Parse JSON
const parsed = JSON.parse(cleaned);

// 3. Validate and normalize amount
if (parsed.amount !== null) {
  const numeric = parseFloat(String(parsed.amount).replace(/[^0-9.]/g, ""));
  parsed.amount = isNaN(numeric) ? null : numeric;
}

// 4. Validate category
if (!CATEGORIES.includes(parsed.category)) {
  parsed.category = "Other";
}

// 5. Validate date
const d = new Date(parsed.date);
if (isNaN(d.getTime())) {
  parsed.date = new Date().toISOString().split("T")[0]; // fallback to today
}
```

---

## Prompt Versioning

| Version | Date | Change | Reason |
|---|---|---|---|
| v1.0 | 2026-05-21 | Initial prompt | Baseline |

*Update this table whenever the prompt is modified and note what changed and why.*

---

## Testing Prompts Manually

Use Google AI Studio (aistudio.google.com) to test prompt variations before updating `gemini.ts`.
Paste the full prompt with a real text sample and verify the JSON output is well-formed and correct.
