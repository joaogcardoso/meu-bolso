document.addEventListener("DOMContentLoaded", async () => {
  const storage = window.MeuBolsoStorage;
  const currency = window.MeuBolsoCurrency;
  const validation = window.MeuBolsoValidation;
  const dom = window.MeuBolsoDom;

  const categories = await loadCategories();
  const categoryById = Object.fromEntries(categories.map((category) => [category.id, category]));
  const validCategoryIds = categories.map((category) => category.id);

  const form = document.getElementById("transaction-form");
  const fields = {
    id: document.getElementById("transaction-id"),
    type: document.getElementById("transaction-type"),
    description: document.getElementById("transaction-description"),
    categoryId: document.getElementById("transaction-category"),
    amount: document.getElementById("transaction-amount"),
    occurredOn: document.getElementById("transaction-date"),
  };
  const errors = {
    type: document.getElementById("transaction-type-error"),
    description: document.getElementById("transaction-description-error"),
    categoryId: document.getElementById("transaction-category-error"),
    amountCents: document.getElementById("transaction-amount-error"),
    occurredOn: document.getElementById("transaction-date-error"),
  };
  const submitButton = document.getElementById("transaction-submit");
  const cancelButton = document.getElementById("transaction-cancel");
  const formTitle = document.getElementById("transaction-form-title");
  const tableBody = document.getElementById("transactions-table-body");
  const searchField = document.getElementById("transaction-search");
  const typeFilter = document.getElementById("transaction-filter-type");
  const sortField = document.getElementById("transaction-sort");
  const feedback = document.getElementById("transaction-feedback");
  const deleteModal = document.getElementById("delete-transaction-modal");
  const deleteCancel = document.getElementById("delete-cancel");
  const deleteConfirm = document.getElementById("delete-confirm");
  let pendingDeleteId = null;
  let submitting = false;

  function loadFormData() {
    return {
      type: fields.type.value,
      description: fields.description.value.trim(),
      categoryId: fields.categoryId.value,
      amountCents: currency.parseCurrencyToCents(fields.amount.value),
      occurredOn: fields.occurredOn.value,
    };
  }

  function clearErrors() {
    dom.setFieldError(fields.type, errors.type, "");
    dom.setFieldError(fields.description, errors.description, "");
    dom.setFieldError(fields.categoryId, errors.categoryId, "");
    dom.setFieldError(fields.amount, errors.amountCents, "");
    dom.setFieldError(fields.occurredOn, errors.occurredOn, "");
  }

  function applyErrors(fieldErrors) {
    clearErrors();
    dom.setFieldError(fields.type, errors.type, fieldErrors.type);
    dom.setFieldError(fields.description, errors.description, fieldErrors.description);
    dom.setFieldError(fields.categoryId, errors.categoryId, fieldErrors.categoryId);
    dom.setFieldError(fields.amount, errors.amountCents, fieldErrors.amountCents);
    dom.setFieldError(fields.occurredOn, errors.occurredOn, fieldErrors.occurredOn);
  }

  function showFeedback(message, type = "success") {
    const alert = dom.createElement("div", {
      className: `alert ${type === "error" ? "alert-error" : "alert-success"} shadow-lg`,
      attributes: { role: "status" },
      children: [dom.createElement("span", { text: message })],
    });
    dom.replaceChildren(feedback, [alert]);
    window.setTimeout(() => dom.replaceChildren(feedback, []), 3000);
  }

  function resetForm() {
    form.reset();
    fields.id.value = "";
    fields.occurredOn.value = new Date().toISOString().slice(0, 10);
    formTitle.textContent = "Novo lançamento";
    submitButton.textContent = "Adicionar";
    cancelButton.classList.add("hidden");
    clearErrors();
  }

  function updateSummary(transactions) {
    const summary = storage.calculateSummary(transactions);
    document.getElementById("summary-balance").textContent = currency.formatCurrency(summary.balanceCents);
    document.getElementById("summary-income").textContent = currency.formatCurrency(summary.incomeCents);
    document.getElementById("summary-expense").textContent = currency.formatCurrency(summary.expenseCents);
  }

  function getFilteredTransactions() {
    const query = searchField.value.trim().toLowerCase();
    const selectedType = typeFilter.value;

    return storage
      .getTransactions()
      .filter((transaction) => {
        const categoryName = categoryById[transaction.categoryId]?.name || transaction.categoryId;
        const matchesQuery =
          !query || transaction.description.toLowerCase().includes(query) || categoryName.toLowerCase().includes(query);
        const matchesType = selectedType === "all" || transaction.type === selectedType;
        return matchesQuery && matchesType;
      })
      .sort((a, b) => {
        if (sortField.value === "date-asc") return a.occurredOn.localeCompare(b.occurredOn);
        if (sortField.value === "amount-desc") return b.amountCents - a.amountCents;
        if (sortField.value === "amount-asc") return a.amountCents - b.amountCents;
        return b.occurredOn.localeCompare(a.occurredOn);
      });
  }

  function createActionButton(label, className, action, id) {
    return dom.createElement("button", {
      className,
      text: label,
      attributes: {
        type: "button",
        "data-action": action,
        "data-id": id,
      },
    });
  }

  function renderTable() {
    const transactions = getFilteredTransactions();

    if (transactions.length === 0) {
      dom.replaceChildren(tableBody, [dom.createEmptyRow(6, "Nenhuma transação encontrada.")]);
      updateSummary(storage.getTransactions());
      return;
    }

    const rows = transactions.map((transaction) => {
      const category = categoryById[transaction.categoryId];
      return dom.createElement("tr", {
        children: [
          dom.createElement("td", { text: currency.formatDate(transaction.occurredOn) }),
          dom.createElement("td", { text: transaction.description }),
          dom.createElement("td", { text: category ? category.name : transaction.categoryId }),
          dom.createElement("td", {
            children: [
              dom.createElement("span", {
                className: `badge ${transaction.type === "income" ? "badge-success" : "badge-error"}`,
                text: transaction.type === "income" ? "Receita" : "Despesa",
              }),
            ],
          }),
          dom.createElement("td", {
            className: `text-right font-medium ${transaction.type === "income" ? "text-success" : "text-error"}`,
            text: `${transaction.type === "income" ? "+" : "-"} ${currency.formatCurrency(transaction.amountCents)}`,
          }),
          dom.createElement("td", {
            className: "text-right",
            children: [
              dom.createElement("div", {
                className: "join justify-end",
                children: [
                  createActionButton("Editar", "btn btn-outline btn-xs join-item", "edit", transaction.id),
                  createActionButton("Excluir", "btn btn-error btn-xs join-item", "delete", transaction.id),
                ],
              }),
            ],
          }),
        ],
      });
    });

    dom.replaceChildren(tableBody, rows);
    updateSummary(storage.getTransactions());
  }

  function startEditing(id) {
    const transaction = storage.getTransactionById(id);

    if (!transaction) {
      showFeedback("Transação não encontrada.", "error");
      return;
    }

    fields.id.value = transaction.id;
    fields.type.value = transaction.type;
    fields.description.value = transaction.description;
    fields.categoryId.value = transaction.categoryId;
    fields.amount.value = (transaction.amountCents / 100).toFixed(2);
    fields.occurredOn.value = transaction.occurredOn;
    formTitle.textContent = "Editar lançamento";
    submitButton.textContent = "Salvar";
    cancelButton.classList.remove("hidden");
    fields.description.focus();
  }

  function openDeleteModal(id) {
    pendingDeleteId = id;
    if (typeof deleteModal.showModal === "function") {
      deleteModal.showModal();
      deleteConfirm.focus();
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    submitting = true;
    submitButton.disabled = true;

    const data = loadFormData();
    const result = validation.validateTransaction(data, validCategoryIds);

    if (!result.isValid) {
      applyErrors(result.errors);
      submitting = false;
      submitButton.disabled = false;
      return;
    }

    if (fields.id.value) {
      storage.updateTransaction(fields.id.value, data);
      showFeedback("Transação atualizada.");
    } else {
      storage.createTransaction(data);
      showFeedback("Transação adicionada.");
    }

    resetForm();
    renderTable();
    submitting = false;
    submitButton.disabled = false;
  });

  cancelButton.addEventListener("click", resetForm);
  searchField.addEventListener("input", renderTable);
  typeFilter.addEventListener("change", renderTable);
  sortField.addEventListener("change", renderTable);

  tableBody.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");

    if (!button) {
      return;
    }

    if (button.dataset.action === "edit") {
      startEditing(button.dataset.id);
    }

    if (button.dataset.action === "delete") {
      openDeleteModal(button.dataset.id);
    }
  });

  deleteCancel.addEventListener("click", () => {
    pendingDeleteId = null;
    deleteModal.close();
  });

  deleteConfirm.addEventListener("click", () => {
    if (pendingDeleteId && storage.deleteTransaction(pendingDeleteId)) {
      showFeedback("Transação excluída.");
      resetForm();
      renderTable();
    }

    pendingDeleteId = null;
    deleteModal.close();
  });

  renderTable();
});

async function loadCategories() {
  try {
    const response = await fetch("/data/categorias.json");

    if (!response.ok) {
      return [];
    }

    return response.json();
  } catch {
    return [];
  }
}
