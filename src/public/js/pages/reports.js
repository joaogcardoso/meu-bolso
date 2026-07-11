document.addEventListener("DOMContentLoaded", async () => {
  const storage = window.MeuBolsoStorage;
  const currency = window.MeuBolsoCurrency;
  const dom = window.MeuBolsoDom;
  const categories = await loadCategories();
  const categoryById = Object.fromEntries(categories.map((category) => [category.id, category]));
  const transactions = storage.getTransactions();
  const summary = storage.calculateSummary(transactions);

  document.getElementById("reports-income").textContent = currency.formatCurrency(summary.incomeCents);
  document.getElementById("reports-expense").textContent = currency.formatCurrency(summary.expenseCents);
  document.getElementById("reports-balance").textContent = currency.formatCurrency(summary.balanceCents);

  renderReport("income-report", groupByCategory(transactions, "income"), categoryById, "income");
  renderReport("expense-report", groupByCategory(transactions, "expense"), categoryById, "expense");

  const emptyContainer = document.getElementById("reports-empty");
  if (transactions.length === 0) {
    dom.replaceChildren(emptyContainer, [
      dom.createElement("div", {
        className: "rounded-box border border-dashed border-base-300 bg-base-100 p-8 text-center",
        children: [
          dom.createElement("h2", { className: "text-lg font-semibold", text: "Nenhum relatório disponível" }),
          dom.createElement("p", {
            className: "mt-2 text-sm text-base-content/70",
            text: "Adicione transações para visualizar receitas, despesas e saldo por categoria.",
          }),
        ],
      }),
    ]);
  }
});

function groupByCategory(transactions, type) {
  const groups = new Map();

  transactions
    .filter((transaction) => transaction.type === type)
    .forEach((transaction) => {
      groups.set(transaction.categoryId, (groups.get(transaction.categoryId) || 0) + transaction.amountCents);
    });

  return Array.from(groups.entries()).sort((a, b) => b[1] - a[1]);
}

function renderReport(containerId, groups, categoryById, type) {
  const dom = window.MeuBolsoDom;
  const currency = window.MeuBolsoCurrency;
  const container = document.getElementById(containerId);

  if (groups.length === 0) {
    dom.replaceChildren(container, [
      dom.createElement("p", {
        className: "text-sm text-base-content/60",
        text: "Nenhum lançamento deste tipo.",
      }),
    ]);
    return;
  }

  const max = Math.max(...groups.map(([, amount]) => amount));
  const rows = groups.map(([categoryId, amount]) => {
    const percentage = max > 0 ? Math.max(4, Math.round((amount / max) * 100)) : 0;
    const category = categoryById[categoryId];
    const bar = dom.createElement("progress", {
      className: `progress ${type === "income" ? "progress-success" : "progress-error"} w-full`,
      attributes: { value: percentage, max: 100 },
    });

    return dom.createElement("div", {
      className: "grid gap-2",
      children: [
        dom.createElement("div", {
          className: "flex items-center justify-between gap-4 text-sm",
          children: [
            dom.createElement("span", { text: category ? category.name : categoryId }),
            dom.createElement("span", { className: "font-medium", text: currency.formatCurrency(amount) }),
          ],
        }),
        bar,
      ],
    });
  });

  dom.replaceChildren(container, rows);
}

async function loadCategories() {
  try {
    const response = await fetch("/data/categorias.json");
    return response.ok ? response.json() : [];
  } catch {
    return [];
  }
}
