(function initCurrency(root, factory) {
  const api = factory();

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.MeuBolsoCurrency = api;
})(typeof window !== "undefined" ? window : globalThis, function currencyFactory() {
  /**
   * Formats a monetary amount stored as integer cents for display in Brazilian Real.
   *
   * @param {number} amountCents - Monetary value in cents.
   * @returns {string} Localized BRL currency string.
   */
  function formatCurrency(amountCents) {
    const value = Number.isInteger(amountCents) ? amountCents / 100 : 0;

    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  /**
   * Converts a user-facing decimal value into integer cents.
   *
   * @param {string|number} value - Value typed by the user.
   * @returns {number|null} Amount in cents, or null when the input is invalid.
   */
  function parseCurrencyToCents(value) {
    const normalized = String(value || "")
      .trim()
      .replace(/\./g, "")
      .replace(",", ".");
    const number = Number(normalized);

    if (!Number.isFinite(number) || number <= 0) {
      return null;
    }

    return Math.round(number * 100);
  }

  /**
   * Formats an ISO date string in YYYY-MM-DD format for display.
   *
   * @param {string} dateISO - Date in YYYY-MM-DD format.
   * @returns {string} Date in DD/MM/YYYY format, or an empty string when invalid.
   */
  function formatDate(dateISO) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateISO || ""))) {
      return "";
    }

    const [year, month, day] = dateISO.split("-");
    return `${day}/${month}/${year}`;
  }

  return {
    formatCurrency,
    parseCurrencyToCents,
    formatDate,
  };
});
