# Relatório de Funcionalidades — Meu Bolso

Este relatório descreve como o projeto **Meu Bolso** atende a cada exigência
apresentada no enunciado do Seminário, para apoiar a apresentação e a
correção do trabalho.

## 1. Ideia e utilidade prática

**Meu Bolso** é uma aplicação de controle financeiro pessoal: o usuário
registra receitas e despesas do dia a dia (salário, freelas, aluguel,
mercado, lazer etc.), acompanha o saldo em tempo real e visualiza para onde o
dinheiro está indo através de relatórios por categoria. É um problema real e
recorrente (organização financeira pessoal), não apenas conceitual.

## 2. Checklist do enunciado

| Exigência | Como foi atendida |
|---|---|
| Vídeo de 15–30 min, ~70% sobre código, no Drive/YouTube privado | A ser gravado pelo(s) aluno(s) apresentando este repositório. |
| Site com pelo menos 5 páginas | `/` (Início), `/transacoes`, `/categorias`, `/relatorios`, `/sobre` — 5 páginas, além de uma página 404 personalizada. |
| Links, imagens, tabelas e formulários | Nav com links internos em todas as páginas; ilustrações SVG originais (`public/images`); tabelas em Início, Transações, Categorias (sugestões) e Sobre (FAQ); formulários em Transações (lançamento), Categorias (sugestão) e Sobre (contato). |
| Uso de framework obrigatório (ExpressJS) | Todo o roteamento e a renderização de páginas usam ExpressJS (`server.js` + `routes/*.js`), seguindo a mesma estrutura do material de apoio (`express-crash-course`). |
| Uso de template engine (EJS) | Todas as páginas são `.ejs`, com partials reaproveitados (`views/partials/head.ejs`, `header.ejs`, `footer.ejs`) e dados vindos das rotas via `res.render(...)`. |
| CSS somente em arquivos externos (sem `<style>` ou atributo `style`) | `public/css/reset.css` e `public/css/style.css`. Nenhuma view usa `<style>` ou o atributo `style=""` — inclusive os elementos gerados dinamicamente em JavaScript usam classes e atributos `data-*` (ex.: `data-largura` nas barras dos relatórios) em vez de estilo inline. |
| Pelo menos 5 tipos diferentes de seletores CSS | Seletor de elemento (`nav`, `table`, `h1`), de classe (`.cartao`, `.btn`), de id (`#topo`), de atributo (`input[type="date"]`, `.barra-preenchimento[data-largura="50"]`), pseudo-classe (`:hover`, `:focus-visible`, `:nth-child(even)`), pseudo-elemento (`.selo::before`, `::placeholder`) e combinador descendente/filho (`.categoria-card > h3`, `.tabela tbody tr`). |
| Elementos de renderização condicional | No servidor: saudação por horário na Home (`routes/index.js`), badge de receita/despesa em Categorias, mensagens de sucesso/erro nos formulários de Categorias e Sobre. No cliente: estados vazios (nenhuma transação, nenhum resultado de busca, nenhum dado para relatório) e destaque do saldo quando negativo. |
| Tabela renderizada a partir de JSON no localStorage, com inserir/editar/remover/buscar | Página **Transações** (`views/transacoes.ejs` + `public/js/transacoes.js`): tabela lida diretamente do `localStorage` (chave `meubolso:transacoes`), com formulário de inserção/edição, botões de editar/excluir por linha e campo de busca textual que filtra por descrição ou categoria. |
| Hospedagem no CodeSandbox e compartilhamento por e-mail | Passo a passo no `README.md`, seção "Como publicar no CodeSandbox". |
| Critérios de avaliação (funcionalidade, estética, domínio do código, bônus de framework) | Funcionalidade: todas as telas e o CRUD funcionam de ponta a ponta (testado localmente, ver seção 4). Estética: identidade visual própria, inspirada em livro-caixa/caderneta bancária (paleta, tipografia e componentes documentados abaixo). Domínio do código: comentários em português explicam cada bloco relevante nos arquivos JS e nas rotas, facilitando a explicação na apresentação. Bônus de framework: uso do ExpressJS em toda a aplicação. |

## 3. Identidade visual

- **Conceito**: livro-caixa / caderneta de banco — linhas horizontais de
  "papel pautado" no fundo, tabela de transações como um livro-razão, valores
  em fonte monoespaçada (como em um extrato).
- **Paleta**: tinta azul-marinho (`#1b2a4a`), papel creme (`#f1ecdd`), verde
  verdigris para receitas (`#2f6f5e`), vermelho-tijolo para despesas
  (`#b5533c`) e dourado como destaque (`#c9a227`).
- **Tipografia**: `Source Serif 4` nos títulos (efeito de caderno impresso),
  `Inter` no corpo do texto e `JetBrains Mono` nos valores monetários.

## 4. Testes realizados durante o desenvolvimento

- Servidor iniciado localmente (`node server.js`) e todas as rotas testadas
  com `curl`: `/`, `/transacoes`, `/categorias`, `/relatorios`, `/sobre` e uma
  rota inexistente (200 nas cinco primeiras, 404 na última, com a página de
  erro personalizada).
- `POST /categorias` testado com dados inválidos (nome curto) → mensagem de
  erro exibida; e com dados válidos → sugestão adicionada à lista.
- `POST /sobre` testado com e-mail inválido → mensagem de erro; e com dados
  válidos → redirecionamento (`302`) para `/sobre?enviado=1` com o alerta de
  sucesso.
- Arquivos estáticos conferidos (`/css/style.css`, `/js/storage.js`,
  `/data/categorias.json`, `/images/logo.svg`) retornando `200`.
- Verificação de que nenhuma view nem script gera atributo `style` ou tag
  `<style>` em tempo de execução.

## 5. Possíveis evoluções (fora do escopo mínimo)

- Editar/excluir categorias diretamente pelo `localStorage`, hoje a lista de
  categorias é fixa.
- Exportar as transações em CSV.
- Suporte a múltiplos meses/anos com filtro de período nos relatórios.
