document.addEventListener("DOMContentLoaded", async function () {
  const {
    obterTransacoes,
    adicionarTransacao,
    atualizarTransacao,
    removerTransacao,
    calcularResumo,
    formatarMoeda,
    formatarData,
  } = window.MeuBolso;

  // ----- Elementos -----
  const form = document.getElementById("form-transacao");
  const campoId = document.getElementById("transacao-id");
  const campoData = document.getElementById("campo-data");
  const campoDescricao = document.getElementById("campo-descricao");
  const campoCategoria = document.getElementById("campo-categoria");
  const campoTipo = document.getElementById("campo-tipo");
  const campoValor = document.getElementById("campo-valor");
  const btnSalvar = document.getElementById("btn-salvar");
  const btnCancelarEdicao = document.getElementById("btn-cancelar-edicao");
  const tituloFormulario = document.getElementById("titulo-formulario");
  const campoBusca = document.getElementById("campo-busca");
  const corpoTabela = document.getElementById("corpo-transacoes");
  const saldoAtual = document.getElementById("razao-saldo");

  // ----- Categorias (para mostrar nome/ícone na tabela e no <select>) -----
  let categoriasPorId = {};
  try {
    const resposta = await fetch("/data/categorias.json");
    const categorias = await resposta.json();
    categoriasPorId = Object.fromEntries(categorias.map((c) => [c.id, c]));
  } catch (erro) {
    console.error("Não foi possível carregar as categorias:", erro);
  }

  function escaparHtml(texto) {
    const div = document.createElement("div");
    div.textContent = texto ?? "";
    return div.innerHTML;
  }

  function atualizarSaldo() {
    const resumo = calcularResumo(obterTransacoes());
    if (saldoAtual) {
      saldoAtual.textContent = formatarMoeda(resumo.saldo);
      saldoAtual.classList.toggle("valor-negativo", resumo.saldo < 0);
    }
  }

  // ----- Renderização da tabela (com filtro de busca textual) -----
  function renderizarTabela() {
    const filtro = (campoBusca?.value || "").trim().toLowerCase();
    const todas = obterTransacoes().sort((a, b) => (a.data < b.data ? 1 : -1));

    const filtradas = !filtro
      ? todas
      : todas.filter((t) => {
          const nomeCategoria = categoriasPorId[t.categoria]?.nome || t.categoria || "";
          return (
            t.descricao.toLowerCase().includes(filtro) ||
            nomeCategoria.toLowerCase().includes(filtro)
          );
        });

    corpoTabela.innerHTML = "";

    // Renderização condicional: nenhuma linha encontrada
    if (filtradas.length === 0) {
      const linha = document.createElement("tr");
      linha.classList.add("linha-vazia");
      linha.innerHTML = `<td colspan="6">${
        filtro ? "Nenhuma transação encontrada para essa busca." : "Você ainda não lançou nenhuma transação. Use o formulário acima para começar."
      }</td>`;
      corpoTabela.appendChild(linha);
      return;
    }

    filtradas.forEach((t) => {
      const cat = categoriasPorId[t.categoria];
      const sinal = t.tipo === "receita" ? "+" : "−";
      const linha = document.createElement("tr");
      linha.dataset.id = t.id;
      linha.innerHTML = `
        <td>${formatarData(t.data)}</td>
        <td>${escaparHtml(t.descricao)}</td>
        <td>${cat ? `${cat.icone} ${escaparHtml(cat.nome)}` : escaparHtml(t.categoria || "—")}</td>
        <td><span class="selo selo--${t.tipo}">${t.tipo === "receita" ? "Receita" : "Despesa"}</span></td>
        <td class="valor valor--${t.tipo}">${sinal} ${formatarMoeda(t.valor)}</td>
        <td class="acoes">
          <button type="button" class="btn btn--linha btn--pequeno" data-acao="editar">Editar</button>
          <button type="button" class="btn btn--perigo btn--pequeno" data-acao="excluir">Excluir</button>
        </td>
      `;
      corpoTabela.appendChild(linha);
    });
  }

  // ----- Inserir / Editar (mesmo formulário, conforme presença de id) -----
  form.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const dados = {
      data: campoData.value,
      descricao: campoDescricao.value.trim(),
      categoria: campoCategoria.value,
      tipo: campoTipo.value,
      valor: parseFloat(campoValor.value),
    };

    if (!dados.data || !dados.descricao || !dados.categoria || isNaN(dados.valor)) {
      return;
    }

    if (campoId.value) {
      atualizarTransacao(campoId.value, dados);
    } else {
      adicionarTransacao(dados);
    }

    encerrarEdicao();
    renderizarTabela();
    atualizarSaldo();
  });

  function iniciarEdicao(id) {
    const transacao = obterTransacoes().find((t) => t.id === id);
    if (!transacao) return;

    campoId.value = transacao.id;
    campoData.value = transacao.data;
    campoDescricao.value = transacao.descricao;
    campoCategoria.value = transacao.categoria;
    campoTipo.value = transacao.tipo;
    campoValor.value = transacao.valor;

    tituloFormulario.textContent = "Editar transação";
    btnSalvar.textContent = "Salvar edição";
    btnCancelarEdicao.hidden = false;
    form.scrollIntoView({ behavior: "smooth", block: "center" });
    campoDescricao.focus();
  }

  function encerrarEdicao() {
    form.reset();
    campoId.value = "";
    campoData.valueAsDate = new Date();
    tituloFormulario.textContent = "Novo lançamento";
    btnSalvar.textContent = "Adicionar";
    btnCancelarEdicao.hidden = true;
  }

  btnCancelarEdicao.addEventListener("click", encerrarEdicao);

  // ----- Delegação de eventos para Editar / Excluir -----
  corpoTabela.addEventListener("click", function (evento) {
    const botao = evento.target.closest("button[data-acao]");
    if (!botao) return;
    const linha = botao.closest("tr[data-id]");
    if (!linha) return;
    const id = linha.dataset.id;

    if (botao.dataset.acao === "editar") {
      iniciarEdicao(id);
    } else if (botao.dataset.acao === "excluir") {
      const confirmar = window.confirm("Excluir esta transação? Essa ação não pode ser desfeita.");
      if (!confirmar) return;
      removerTransacao(id);
      if (campoId.value === id) encerrarEdicao();
      renderizarTabela();
      atualizarSaldo();
    }
  });

  // ----- Busca textual -----
  campoBusca?.addEventListener("input", renderizarTabela);

  // ----- Primeira renderização -----
  renderizarTabela();
  atualizarSaldo();
});
