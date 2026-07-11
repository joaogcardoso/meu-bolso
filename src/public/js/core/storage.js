(function initStorage(root, factory) {
  const api = factory(root);

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.MeuBolsoStorage = api;
})(typeof window !== "undefined" ? window : globalThis, function storageFactory(root) {
  const STORAGE_KEY = "meubolso:v2:transactions";
  const LEGACY_KEY = "meubolso:transacoes";
  const SUGGESTIONS_KEY = "meubolso:v1:category-suggestions";
  const SCHEMA_VERSION = 2;

  function getLocalStorage() {
    return root.localStorage;
  }

  function nowISO() {
    return new Date().toISOString();
  }

  function createId() {
    if (root.crypto && typeof root.crypto.randomUUID === "function") {
      return root.crypto.randomUUID();
    }

    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function safeParse(raw) {
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function normalizeLegacyType(type) {
    if (type === "receita" || type === "income") {
      return "income";
    }

    return "expense";
  }

  function legacyCategoryId(categoryId) {
    const map = {
      salario: "salary",
      freelance: "freelance",
      investimentos: "investments",
      moradia: "housing",
      alimentacao: "food",
      transporte: "transport",
      saude: "health",
      educacao: "education",
      lazer: "leisure",
      outros: "other",
    };

    return map[categoryId] || categoryId || "other";
  }

  function normalizeAmountCents(transaction) {
    if (Number.isInteger(transaction.amountCents) && transaction.amountCents > 0) {
      return transaction.amountCents;
    }

    const value = Number(transaction.valor || transaction.amount || 0);
    return Number.isFinite(value) && value > 0 ? Math.round(value * 100) : 0;
  }

  function isValidDate(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
  }

  function normalizeTransaction(transaction) {
    const createdAt = transaction.createdAt || nowISO();
    const updatedAt = transaction.updatedAt || createdAt;
    const normalized = {
      id: String(transaction.id || createId()),
      type: normalizeLegacyType(transaction.type || transaction.tipo),
      description: String(transaction.description || transaction.descricao || "").trim(),
      categoryId: legacyCategoryId(transaction.categoryId || transaction.categoria),
      amountCents: normalizeAmountCents(transaction),
      occurredOn: isValidDate(transaction.occurredOn || transaction.data)
        ? transaction.occurredOn || transaction.data
        : new Date().toISOString().slice(0, 10),
      createdAt,
      updatedAt,
    };

    if (!normalized.description || normalized.amountCents <= 0) {
      return null;
    }

    return normalized;
  }

  function deduplicate(transactions) {
    const seen = new Set();
    const result = [];

    transactions.forEach((transaction) => {
      if (!transaction || seen.has(transaction.id)) {
        return;
      }

      seen.add(transaction.id);
      result.push(transaction);
    });

    return result;
  }

  function readEnvelope() {
    const storage = getLocalStorage();
    const currentRaw = storage.getItem(STORAGE_KEY);
    const current = safeParse(currentRaw);

    if (current && current.version === SCHEMA_VERSION && Array.isArray(current.transactions)) {
      return {
        version: SCHEMA_VERSION,
        transactions: deduplicate(current.transactions.map(normalizeTransaction).filter(Boolean)),
      };
    }

    const legacy = safeParse(storage.getItem(LEGACY_KEY));

    if (Array.isArray(legacy)) {
      const migrated = deduplicate(legacy.map(normalizeTransaction).filter(Boolean));
      writeEnvelope(migrated);
      return {
        version: SCHEMA_VERSION,
        transactions: migrated,
      };
    }

    if (currentRaw && current === null) {
      storage.removeItem(STORAGE_KEY);
    }

    return {
      version: SCHEMA_VERSION,
      transactions: [],
    };
  }

  function writeEnvelope(transactions) {
    getLocalStorage().setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: SCHEMA_VERSION,
        transactions: deduplicate(transactions.map(normalizeTransaction).filter(Boolean)),
      }),
    );
  }

  /**
   * Reads all transactions from localStorage, applying schema migration and normalization.
   *
   * @returns {Array<Object>} Transactions sorted by occurrence date descending.
   */
  function getTransactions() {
    return readEnvelope().transactions.sort((a, b) => b.occurredOn.localeCompare(a.occurredOn));
  }

  /**
   * Finds a transaction by ID in the normalized local collection.
   *
   * @param {string} id - Transaction identifier.
   * @returns {Object|null} Transaction when found, otherwise null.
   */
  function getTransactionById(id) {
    return getTransactions().find((transaction) => transaction.id === id) || null;
  }

  /**
   * Creates a transaction and persists the updated schema envelope in localStorage.
   *
   * @param {Object} data - Normalized transaction input.
   * @param {'income'|'expense'} data.type - Transaction type.
   * @param {string} data.description - Description shown to the user.
   * @param {string} data.categoryId - Category identifier.
   * @param {number} data.amountCents - Monetary amount in integer cents.
   * @param {string} data.occurredOn - Occurrence date in YYYY-MM-DD format.
   * @returns {Object} Created transaction.
   * @throws {Error} When the transaction cannot be normalized.
   */
  function createTransaction(data) {
    const transaction = normalizeTransaction({
      ...data,
      id: createId(),
      createdAt: nowISO(),
      updatedAt: nowISO(),
    });

    if (!transaction) {
      throw new Error("Invalid transaction.");
    }

    const transactions = getTransactions();
    writeEnvelope([...transactions, transaction]);
    return transaction;
  }

  /**
   * Updates a transaction without changing its identifier or creation timestamp.
   *
   * @param {string} id - Transaction identifier.
   * @param {Object} data - Replacement transaction fields.
   * @returns {Object|null} Updated transaction, or null when the ID does not exist.
   * @throws {Error} When the update would produce an invalid transaction.
   */
  function updateTransaction(id, data) {
    const transactions = getTransactions();
    const index = transactions.findIndex((transaction) => transaction.id === id);

    if (index === -1) {
      return null;
    }

    const updated = normalizeTransaction({
      ...transactions[index],
      ...data,
      id,
      createdAt: transactions[index].createdAt,
      updatedAt: nowISO(),
    });

    if (!updated) {
      throw new Error("Invalid transaction.");
    }

    transactions[index] = updated;
    writeEnvelope(transactions);
    return updated;
  }

  /**
   * Removes a transaction from the local collection.
   *
   * @param {string} id - Transaction identifier.
   * @returns {boolean} Whether a transaction was removed.
   */
  function deleteTransaction(id) {
    const transactions = getTransactions();
    const next = transactions.filter((transaction) => transaction.id !== id);
    writeEnvelope(next);
    return next.length !== transactions.length;
  }

  /**
   * Clears all locally stored transactions while preserving the current schema envelope.
   *
   * @returns {void}
   */
  function clearTransactions() {
    writeEnvelope([]);
  }

  /**
   * Calculates financial totals according to the project simulation rules.
   * Income increases the balance and expenses decrease it.
   *
   * @param {Array<Object>} transactions - Transactions to summarize.
   * @returns {{incomeCents: number, expenseCents: number, balanceCents: number}} Summary in cents.
   */
  function calculateSummary(transactions = getTransactions()) {
    return transactions.reduce(
      (summary, transaction) => {
        if (transaction.type === "income") {
          summary.incomeCents += transaction.amountCents;
          summary.balanceCents += transaction.amountCents;
        } else {
          summary.expenseCents += transaction.amountCents;
          summary.balanceCents -= transaction.amountCents;
        }

        return summary;
      },
      { incomeCents: 0, expenseCents: 0, balanceCents: 0 },
    );
  }

  function getCategorySuggestions() {
    const parsed = safeParse(getLocalStorage().getItem(SUGGESTIONS_KEY));

    if (!Array.isArray(parsed)) {
      return [];
    }

    return deduplicate(
      parsed
        .map((suggestion) => ({
          id: String(suggestion.id || createId()),
          name: String(suggestion.name || "").trim(),
          type: normalizeLegacyType(suggestion.type),
          createdAt: suggestion.createdAt || nowISO(),
        }))
        .filter((suggestion) => suggestion.name.length >= 3),
    );
  }

  function saveCategorySuggestions(suggestions) {
    getLocalStorage().setItem(SUGGESTIONS_KEY, JSON.stringify(suggestions));
  }

  function createCategorySuggestion(data) {
    const suggestions = getCategorySuggestions();
    const normalizedName = String(data.name || "").trim();
    const duplicate = suggestions.some(
      (suggestion) => suggestion.name.toLowerCase() === normalizedName.toLowerCase() && suggestion.type === data.type,
    );

    if (duplicate) {
      return null;
    }

    const suggestion = {
      id: createId(),
      name: normalizedName,
      type: normalizeLegacyType(data.type),
      createdAt: nowISO(),
    };

    saveCategorySuggestions([...suggestions, suggestion]);
    return suggestion;
  }

  function clearCategorySuggestions() {
    saveCategorySuggestions([]);
  }

  return {
    STORAGE_KEY,
    LEGACY_KEY,
    SCHEMA_VERSION,
    getTransactions,
    getTransactionById,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    clearTransactions,
    calculateSummary,
    getCategorySuggestions,
    createCategorySuggestion,
    clearCategorySuggestions,
  };
});
