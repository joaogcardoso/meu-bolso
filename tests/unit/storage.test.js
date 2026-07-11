function loadStorageModule() {
  vi.resetModules();
  return require("../../src/public/js/core/storage");
}

describe("MeuBolsoStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("creates transactions using cents and schema version 2", () => {
    const storage = loadStorageModule();
    const created = storage.createTransaction({
      type: "income",
      description: "Salário",
      categoryId: "salary",
      amountCents: 320000,
      occurredOn: "2026-07-10",
    });

    expect(created.id).toBeTruthy();
    expect(created.amountCents).toBe(320000);
    expect(storage.getTransactions()).toHaveLength(1);

    const envelope = JSON.parse(localStorage.getItem(storage.STORAGE_KEY));
    expect(envelope.version).toBe(2);
  });

  it("updates transactions without changing the original id", () => {
    const storage = loadStorageModule();
    const created = storage.createTransaction({
      type: "expense",
      description: "Internet",
      categoryId: "other",
      amountCents: 12990,
      occurredOn: "2026-07-10",
    });

    const updated = storage.updateTransaction(created.id, {
      type: "expense",
      description: "Internet residencial",
      categoryId: "housing",
      amountCents: 13990,
      occurredOn: "2026-07-11",
    });

    expect(updated.id).toBe(created.id);
    expect(updated.description).toBe("Internet residencial");
    expect(updated.amountCents).toBe(13990);
  });

  it("deletes transactions by id", () => {
    const storage = loadStorageModule();
    const created = storage.createTransaction({
      type: "expense",
      description: "Mercado",
      categoryId: "food",
      amountCents: 5000,
      occurredOn: "2026-07-10",
    });

    expect(storage.deleteTransaction(created.id)).toBe(true);
    expect(storage.getTransactions()).toHaveLength(0);
  });

  it("calculates income, expense and balance", () => {
    const storage = loadStorageModule();

    storage.createTransaction({
      type: "income",
      description: "Receita",
      categoryId: "salary",
      amountCents: 10000,
      occurredOn: "2026-07-10",
    });
    storage.createTransaction({
      type: "expense",
      description: "Despesa",
      categoryId: "food",
      amountCents: 3500,
      occurredOn: "2026-07-10",
    });

    expect(storage.calculateSummary()).toEqual({
      incomeCents: 10000,
      expenseCents: 3500,
      balanceCents: 6500,
    });
  });

  it("ignores corrupted JSON and returns an empty collection", () => {
    const storage = loadStorageModule();
    localStorage.setItem(storage.STORAGE_KEY, "{invalid");

    expect(storage.getTransactions()).toEqual([]);
    expect(localStorage.getItem(storage.STORAGE_KEY)).toBeNull();
  });

  it("migrates legacy transactions from the original key", () => {
    const storage = loadStorageModule();
    localStorage.setItem(
      storage.LEGACY_KEY,
      JSON.stringify([
        {
          id: "abc",
          tipo: "receita",
          descricao: "Salário",
          categoria: "salario",
          valor: 1500,
          data: "2026-07-10",
        },
      ]),
    );

    const transactions = storage.getTransactions();
    expect(transactions[0]).toMatchObject({
      id: "abc",
      type: "income",
      categoryId: "salary",
      amountCents: 150000,
    });
  });
});
