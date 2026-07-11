/**
 * Validates the server-side contact form without persisting or logging personal data.
 *
 * @param {Object} input - Raw request body.
 * @returns {{values: Object, errors: Object<string, string>, isValid: boolean}} Validation result.
 */
function validateContact(input) {
  const values = {
    name: String(input.name || "").trim(),
    email: String(input.email || "").trim(),
    message: String(input.message || "").trim(),
  };

  const errors = {};

  if (values.name.length < 2) {
    errors.name = "Informe seu nome com pelo menos 2 caracteres.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Informe um e-mail válido.";
  }

  if (values.message.length < 10) {
    errors.message = "Escreva uma mensagem com pelo menos 10 caracteres.";
  }

  if (values.message.length > 1000) {
    errors.message = "A mensagem deve ter no máximo 1000 caracteres.";
  }

  return {
    values,
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}

module.exports = {
  validateContact,
};
