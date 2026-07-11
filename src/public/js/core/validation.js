(function initValidation(root, factory) {
  const api = factory();

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.MeuBolsoValidation = api;
})(typeof window !== "undefined" ? window : globalThis, function validationFactory() {
  /**
   * Validates dates accepted by the financial forms.
   *
   * @param {string} value - Date in YYYY-MM-DD format.
   * @returns {boolean} Whether the date is syntactically and semantically valid.
   */
  function isValidDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) {
      return false;
    }

    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }

  /**
   * Validates a transaction before it is persisted in localStorage.
   *
   * @param {Object} data - Transaction candidate.
   * @param {'income'|'expense'} data.type - Transaction type.
   * @param {string} data.description - User-facing description.
   * @param {string} data.categoryId - Category identifier.
   * @param {number} data.amountCents - Positive monetary amount in cents.
   * @param {string} data.occurredOn - Occurrence date in YYYY-MM-DD format.
   * @param {string[]} validCategoryIds - Category IDs loaded from static JSON.
   * @returns {{isValid: boolean, errors: Object<string, string>}} Validation result.
   */
  function validateTransaction(data, validCategoryIds) {
    const errors = {};

    if (data.type !== "income" && data.type !== "expense") {
      errors.type = "Escolha receita ou despesa.";
    }

    if (!data.description || data.description.trim().length < 2) {
      errors.description = "Informe uma descrição com pelo menos 2 caracteres.";
    }

    if (data.description && data.description.trim().length > 80) {
      errors.description = "A descrição deve ter no máximo 80 caracteres.";
    }

    if (!data.categoryId || !validCategoryIds.includes(data.categoryId)) {
      errors.categoryId = "Escolha uma categoria válida.";
    }

    if (!Number.isInteger(data.amountCents) || data.amountCents <= 0) {
      errors.amountCents = "Informe um valor maior que zero.";
    }

    if (!isValidDate(data.occurredOn)) {
      errors.occurredOn = "Informe uma data válida.";
    }

    return {
      errors,
      isValid: Object.keys(errors).length === 0,
    };
  }

  /**
   * Validates a local category suggestion before saving it in localStorage.
   *
   * @param {Object} data - Category suggestion candidate.
   * @param {string} data.name - Suggested category name.
   * @param {'income'|'expense'} data.type - Suggested category type.
   * @returns {{isValid: boolean, errors: Object<string, string>}} Validation result.
   */
  function validateCategorySuggestion(data) {
    const errors = {};

    if (!data.name || data.name.trim().length < 3) {
      errors.name = "Informe uma categoria com pelo menos 3 caracteres.";
    }

    if (data.name && data.name.trim().length > 60) {
      errors.name = "O nome deve ter no máximo 60 caracteres.";
    }

    if (data.type !== "income" && data.type !== "expense") {
      errors.type = "Escolha receita ou despesa.";
    }

    return {
      errors,
      isValid: Object.keys(errors).length === 0,
    };
  }

  return {
    isValidDate,
    validateTransaction,
    validateCategorySuggestion,
  };
});
