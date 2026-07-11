const validation = require("../../src/public/js/core/validation");
const { validateContact } = require("../../src/validators/contact.validator");
const { validateCategorySuggestion } = require("../../src/validators/category.validator");

describe("frontend validation", () => {
  it("accepts a valid transaction", () => {
    const result = validation.validateTransaction(
      {
        type: "expense",
        description: "Internet",
        categoryId: "housing",
        amountCents: 12990,
        occurredOn: "2026-07-10",
      },
      ["housing"],
    );

    expect(result.isValid).toBe(true);
  });

  it("rejects invalid value and invalid date", () => {
    const result = validation.validateTransaction(
      {
        type: "expense",
        description: "Internet",
        categoryId: "housing",
        amountCents: 0,
        occurredOn: "2026-15-99",
      },
      ["housing"],
    );

    expect(result.isValid).toBe(false);
    expect(result.errors.amountCents).toBeTruthy();
    expect(result.errors.occurredOn).toBeTruthy();
  });

  it("validates local category suggestions", () => {
    expect(validateCategorySuggestion({ name: "Pets", type: "expense" }).isValid).toBe(true);
    expect(validateCategorySuggestion({ name: "P", type: "other" }).isValid).toBe(false);
  });
});

describe("contact validator", () => {
  it("accepts a valid contact form", () => {
    const result = validateContact({
      name: "Ana",
      email: "ana@example.com",
      message: "Mensagem com conteúdo suficiente.",
    });

    expect(result.isValid).toBe(true);
  });

  it("returns field errors for invalid contact form", () => {
    const result = validateContact({
      name: "A",
      email: "email-invalido",
      message: "Curta",
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.name).toBeTruthy();
    expect(result.errors.email).toBeTruthy();
    expect(result.errors.message).toBeTruthy();
  });
});
