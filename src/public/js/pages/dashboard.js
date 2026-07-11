document.addEventListener("DOMContentLoaded", () => {
  const storage = window.MeuBolsoStorage;
  const currency = window.MeuBolsoCurrency;
  const dom = window.MeuBolsoDom;

  const transactions = storage.getTransactions();
  const summary = storage.calculateSummary(transactions);

  document.getElementById("dashboard-balance").textContent = currency.formatCurrency(summary.balanceCents);
  document.getElementById("dashboard-income").textContent = currency.formatCurrency(summary.incomeCents);
  document.getElementById("dashboard-expense").textContent = currency.formatCurrency(summary.expenseCents);

  const tableBody = document.getElementById("recent-transactions");
  const recentRows = transactions.slice(0, 5).map((transaction) =>
    dom.createElement("tr", {
      children: [
        dom.createElement("td", { text: currency.formatDate(transaction.occurredOn) }),
        dom.createElement("td", { text: transaction.description }),
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
      ],
    }),
  );

  dom.replaceChildren(
    tableBody,
    recentRows.length ? recentRows : [dom.createEmptyRow(4, "Nenhuma transação registrada neste navegador.")],
  );
});
