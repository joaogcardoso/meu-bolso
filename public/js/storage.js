/**
 * Meu Bolso — camada de acesso ao localStorage.
 * Todas as transações do usuário são guardadas apenas no navegador,
 * sob a chave abaixo, como uma lista (array) de objetos JSON.
 */
(function (window) {
  const CHAVE_TRANSACOES = "meubolso:transacoes";
  const CHAVE_SEMEADO = "meubolso:semeado";

  function gerarId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function obterTransacoes() {
    try {
      const bruto = localStorage.getItem(CHAVE_TRANSACOES);
      const lista = bruto ? JSON.parse(bruto) : [];
      return Array.isArray(lista) ? lista : [];
    } catch (erro) {
      console.error("Não foi possível ler as transações do localStorage:", erro);
      return [];
    }
  }

  function salvarTransacoes(lista) {
    localStorage.setItem(CHAVE_TRANSACOES, JSON.stringify(lista));
  }

  function adicionarTransacao(transacao) {
    const lista = obterTransacoes();
    const nova = { id: gerarId(), ...transacao };
    lista.push(nova);
    salvarTransacoes(lista);
    return nova;
  }

  function atualizarTransacao(id, dados) {
    const lista = obterTransacoes();
    const indice = lista.findIndex((t) => t.id === id);
    if (indice === -1) return null;
    lista[indice] = { ...lista[indice], ...dados, id };
    salvarTransacoes(lista);
    return lista[indice];
  }

  function removerTransacao(id) {
    const lista = obterTransacoes().filter((t) => t.id !== id);
    salvarTransacoes(lista);
  }

  function calcularResumo(lista) {
    return lista.reduce(
      (resumo, t) => {
        const valor = Number(t.valor) || 0;
        if (t.tipo === "receita") {
          resumo.receitas += valor;
          resumo.saldo += valor;
        } else {
          resumo.despesas += valor;
          resumo.saldo -= valor;
        }
        return resumo;
      },
      { receitas: 0, despesas: 0, saldo: 0 }
    );
  }

  function formatarMoeda(valor) {
    const numero = Number(valor) || 0;
    return numero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatarData(dataISO) {
    if (!dataISO) return "";
    const [ano, mes, dia] = dataISO.split("-");
    if (!ano || !mes || !dia) return dataISO;
    return `${dia}/${mes}/${ano}`;
  }

  // Semeia alguns lançamentos de exemplo apenas na primeiríssima visita,
  // para a tabela não nascer vazia na demonstração. Se o usuário apagar
  // tudo depois, respeitamos a escolha e não semeamos de novo.
  function semearSeNecessario() {
    if (localStorage.getItem(CHAVE_SEMEADO)) return;
    localStorage.setItem(CHAVE_SEMEADO, "1");
    if (obterTransacoes().length > 0) return;

    const hoje = new Date();
    const iso = (offsetDias) => {
      const d = new Date(hoje);
      d.setDate(d.getDate() - offsetDias);
      return d.toISOString().slice(0, 10);
    };

    const exemplos = [
      { data: iso(1), descricao: "Salário", categoria: "salario", tipo: "receita", valor: 3200 },
      { data: iso(2), descricao: "Supermercado", categoria: "alimentacao", tipo: "despesa", valor: 380.5 },
      { data: iso(3), descricao: "Aluguel", categoria: "moradia", tipo: "despesa", valor: 950 },
      { data: iso(5), descricao: "Projeto freelance", categoria: "freelance", tipo: "receita", valor: 600 },
      { data: iso(6), descricao: "Cinema", categoria: "lazer", tipo: "despesa", valor: 62 },
    ];
    salvarTransacoes(exemplos.map((t) => ({ id: gerarId(), ...t })));
  }

  window.MeuBolso = {
    obterTransacoes,
    salvarTransacoes,
    adicionarTransacao,
    atualizarTransacao,
    removerTransacao,
    calcularResumo,
    formatarMoeda,
    formatarData,
    gerarId,
    semearSeNecessario,
  };

  document.addEventListener("DOMContentLoaded", semearSeNecessario);
})(window);
