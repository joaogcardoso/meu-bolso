function validateCategorySuggestion(input) {
  const values = {
    name: String(input.name || "").trim(),
    type: String(input.type || "").trim(),
  };

  const errors = {};

  if (values.name.length < 3) {
    errors.name = "Informe uma categoria com pelo menos 3 caracteres.";
  }

  if (values.type !== "income" && values.type !== "expense") {
    errors.type = "Escolha receita ou despesa.";
  }

  return {
    values,
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}

if (typeof module !== "undefined") {
  module.exports = {
    validateCategorySuggestion,
  };
}
