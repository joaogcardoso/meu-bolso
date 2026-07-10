document.addEventListener("DOMContentLoaded", function () {
  const { obterTransacoes, calcularResumo, formatarMoeda, formatarData } = window.MeuBolso;

  const lista = obterTransacoes();
  const resumo = calcularResumo(lista);

  const elSaldo = document.getElementById("valor-saldo");
  const elReceitas = document.getElementById("valor-receitas");
  const elDespesas = document.getElementById("valor-despesas");

  if (elSaldo) elSaldo.textContent = formatarMoeda(resumo.saldo);
  if (elReceitas) elReceitas.textContent = formatarMoeda(resumo.receitas);
  if (elDespesas) elDespesas.textContent = formatarMoeda(resumo.despesas);

  // Renderização condicional: saldo negativo ganha destaque em vermelho
  if (elSaldo) {
    elSaldo.classList.toggle("valor-negativo", resumo.saldo < 0);
  }

  const corpoTabela = document.getElementById("corpo-recentes");
  const linhaVazia = document.getElementById("linha-vazia-recentes");
  if (!corpoTabela) return;

  const recentes = [...lista]
    .sort((a, b) => (a.data < b.data ? 1 : -1))
    .slice(0, 5);

  corpoTabela.innerHTML = "";

  if (recentes.length === 0) {
    if (linhaVazia) corpoTabela.appendChild(linhaVazia);
    return;
  }

  recentes.forEach((t) => {
    const linha = document.createElement("tr");
    const sinal = t.tipo === "receita" ? "+" : "−";
    linha.innerHTML = `
      <td>${formatarData(t.data)}</td>
      <td>${escaparHtml(t.descricao)}</td>
      <td><span class="selo selo--${t.tipo}">${t.tipo === "receita" ? "Receita" : "Despesa"}</span></td>
      <td class="valor valor--${t.tipo}">${sinal} ${formatarMoeda(t.valor)}</td>
    `;
    corpoTabela.appendChild(linha);
  });

  function escaparHtml(texto) {
    const div = document.createElement("div");
    div.textContent = texto ?? "";
    return div.innerHTML;
  }
});
