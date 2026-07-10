document.addEventListener("DOMContentLoaded", async function () {
  const { obterTransacoes, formatarMoeda } = window.MeuBolso;

  let categoriasPorId = {};
  try {
    const resposta = await fetch("/data/categorias.json");
    const categorias = await resposta.json();
    categoriasPorId = Object.fromEntries(categorias.map((c) => [c.id, c]));
  } catch (erro) {
    console.error("Não foi possível carregar as categorias:", erro);
  }

  const lista = obterTransacoes();

  const secaoVazia = document.getElementById("relatorio-vazio");
  const secaoConteudo = document.getElementById("relatorio-conteudo");

  // Renderização condicional: sem lançamentos, mostramos apenas o estado vazio
  if (lista.length === 0) {
    if (secaoVazia) secaoVazia.hidden = false;
    if (secaoConteudo) secaoConteudo.hidden = true;
    return;
  }
  if (secaoVazia) secaoVazia.hidden = true;
  if (secaoConteudo) secaoConteudo.hidden = false;

  function agrupar(tipo) {
    const grupos = {};
    lista
      .filter((t) => t.tipo === tipo)
      .forEach((t) => {
        grupos[t.categoria] = (grupos[t.categoria] || 0) + (Number(t.valor) || 0);
      });
    return Object.entries(grupos).sort((a, b) => b[1] - a[1]);
  }

  function desenharBarras(elementoId, grupos, tipo) {
    const container = document.getElementById(elementoId);
    if (!container) return;
    container.innerHTML = "";

    if (grupos.length === 0) {
      container.innerHTML = `<p class="alerta alerta--vazio">Nenhum lançamento desse tipo ainda.</p>`;
      return;
    }

    const maior = Math.max(...grupos.map(([, valor]) => valor));

    grupos.forEach(([categoriaId, valor]) => {
      const cat = categoriasPorId[categoriaId];
      const nome = cat ? `${cat.icone} ${cat.nome}` : categoriaId;
      // Arredondamos para o múltiplo de 5% mais próximo e usamos um atributo
      // data-largura (lido pelo CSS via seletor de atributo) em vez de um
      // parâmetro style inline, já que o site não usa estilos em linha.
      const bruta = maior > 0 ? (valor / maior) * 100 : 0;
      const largura = Math.min(100, Math.max(5, Math.round(bruta / 5) * 5));

      const linha = document.createElement("div");
      linha.className = "barra-linha";
      linha.innerHTML = `
        <span>${nome}</span>
        <span class="barra-trilha">
          <span class="barra-preenchimento barra-preenchimento--${tipo}" data-largura="${largura}"></span>
        </span>
        <span class="barra-valor">${formatarMoeda(valor)}</span>
      `;
      container.appendChild(linha);
    });
  }

  const receitas = agrupar("receita");
  const despesas = agrupar("despesa");

  desenharBarras("barras-receitas", receitas, "receita");
  desenharBarras("barras-despesas", despesas, "despesa");

  const totalReceitas = receitas.reduce((soma, [, v]) => soma + v, 0);
  const totalDespesas = despesas.reduce((soma, [, v]) => soma + v, 0);

  const elTotalReceitas = document.getElementById("relatorio-total-receitas");
  const elTotalDespesas = document.getElementById("relatorio-total-despesas");
  const elSaldoFinal = document.getElementById("relatorio-saldo");

  if (elTotalReceitas) elTotalReceitas.textContent = formatarMoeda(totalReceitas);
  if (elTotalDespesas) elTotalDespesas.textContent = formatarMoeda(totalDespesas);
  if (elSaldoFinal) {
    const saldo = totalReceitas - totalDespesas;
    elSaldoFinal.textContent = formatarMoeda(saldo);
    elSaldoFinal.classList.toggle("valor-negativo", saldo < 0);
  }
});
