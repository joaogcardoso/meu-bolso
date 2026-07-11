const currency = require("../../src/public/js/core/currency");

describe("currency helpers", () => {
  it("formats integer cents as BRL", () => {
    expect(currency.formatCurrency(12990)).toBe("R$ 129,90");
  });

  it("parses decimal input into integer cents", () => {
    expect(currency.parseCurrencyToCents("129,90")).toBe(12990);
    expect(currency.parseCurrencyToCents("1.234,56")).toBe(123456);
  });

  it("rejects invalid or non-positive money input", () => {
    expect(currency.parseCurrencyToCents("0")).toBeNull();
    expect(currency.parseCurrencyToCents("abc")).toBeNull();
  });

  it("formats ISO dates for display", () => {
    expect(currency.formatDate("2026-07-10")).toBe("10/07/2026");
    expect(currency.formatDate("invalid")).toBe("");
  });
});
