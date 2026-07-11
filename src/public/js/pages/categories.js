document.addEventListener("DOMContentLoaded", () => {
  const storage = window.MeuBolsoStorage;
  const validation = window.MeuBolsoValidation;
  const dom = window.MeuBolsoDom;

  const form = document.getElementById("category-suggestion-form");
  const nameField = document.getElementById("category-name");
  const typeField = document.getElementById("category-type");
  const nameError = document.getElementById("category-name-error");
  const typeError = document.getElementById("category-type-error");
  const tableBody = document.getElementById("category-suggestions-body");
  const clearButton = document.getElementById("clear-category-suggestions");
  const feedback = document.getElementById("category-feedback");

  function renderSuggestions() {
    const suggestions = storage.getCategorySuggestions();

    if (suggestions.length === 0) {
      dom.replaceChildren(tableBody, [dom.createEmptyRow(2, "Nenhuma sugestão local registrada.")]);
      return;
    }

    const rows = suggestions.map((suggestion) =>
      dom.createElement("tr", {
        children: [
          dom.createElement("td", { text: suggestion.name }),
          dom.createElement("td", { text: suggestion.type === "income" ? "Receita" : "Despesa" }),
        ],
      }),
    );

    dom.replaceChildren(tableBody, rows);
  }

  function clearErrors() {
    dom.setFieldError(nameField, nameError, "");
    dom.setFieldError(typeField, typeError, "");
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearErrors();

    const data = {
      name: nameField.value.trim(),
      type: typeField.value,
    };
    const result = validation.validateCategorySuggestion(data);

    if (!result.isValid) {
      dom.setFieldError(nameField, nameError, result.errors.name);
      dom.setFieldError(typeField, typeError, result.errors.type);
      return;
    }

    const created = storage.createCategorySuggestion(data);

    if (!created) {
      feedback.textContent = "Essa sugestão já existe neste navegador.";
      return;
    }

    form.reset();
    feedback.textContent = "Sugestão salva localmente.";
    renderSuggestions();
  });

  clearButton.addEventListener("click", () => {
    storage.clearCategorySuggestions();
    feedback.textContent = "Sugestões locais removidas.";
    renderSuggestions();
  });

  renderSuggestions();
});
