# 💰 Meu Bolso — Controle Financeiro Pessoal

Projeto acadêmico (Seminário) construído com **Node.js**, **ExpressJS** e o motor de
templates **EJS**, com persistência das transações financeiras no **localStorage**
do navegador.

> Todos os lançamentos (receitas e despesas) ficam guardados apenas no seu
> navegador, em formato JSON, na chave `meubolso:transacoes` do `localStorage`.
> Nada é enviado a um banco de dados ou servidor externo.

## ✨ Funcionalidades

- **Dashboard** com saldo atual, total de receitas/despesas e últimos lançamentos.
- **Transações**: inserir, editar, excluir e **buscar por texto** (descrição ou
  categoria), em uma tabela estilo livro-razão.
- **Categorias**: lista de categorias pré-definidas (renderizada pelo servidor a
  partir de um JSON) + formulário para sugerir novas categorias, com validação
  no servidor.
- **Relatórios**: gráfico de barras (CSS puro) com o total gasto/recebido por
  categoria, calculado a partir dos dados do `localStorage`.
- **Sobre**: explicação do projeto, perguntas frequentes e formulário de
  contato com validação de e-mail no servidor.
- Elementos de **renderização condicional** no servidor (saudação de acordo com
  o horário, mensagens de sucesso/erro, cores por tipo de categoria) e no
  cliente (estados vazios, saldo negativo em destaque).

## 🧱 Stack

| Camada        | Tecnologia                          |
|---------------|--------------------------------------|
| Servidor      | Node.js + ExpressJS                  |
| Views         | EJS (Embedded JavaScript templates)  |
| Estilo        | CSS puro, em arquivos externos       |
| Persistência  | `localStorage` (navegador)           |
| Fontes        | Source Serif 4, Inter, JetBrains Mono (Google Fonts) |

## 📁 Estrutura de pastas

```
meu-bolso/
├── server.js                 # ponto de entrada do Express
├── package.json
├── routes/                   # um router por página/recurso
│   ├── index.js              # "/"           → dashboard
│   ├── transacoes.js         # "/transacoes" → tela de lançamentos
│   ├── categorias.js         # "/categorias" → lista + sugestão (POST)
│   ├── relatorios.js         # "/relatorios" → relatórios
│   └── sobre.js              # "/sobre"      → sobre + contato (POST)
├── views/
│   ├── partials/             # head, header (nav) e footer reaproveitados
│   ├── index.ejs
│   ├── transacoes.ejs
│   ├── categorias.ejs
│   ├── relatorios.ejs
│   ├── sobre.ejs
│   └── 404.ejs
└── public/
    ├── css/                  # reset.css + style.css (nenhum estilo inline)
    ├── js/
    │   ├── storage.js        # camada de acesso ao localStorage (CRUD)
    │   ├── transacoes.js     # lógica da tabela (inserir/editar/excluir/buscar)
    │   ├── dashboard.js      # resumo + últimos lançamentos na home
    │   └── relatorios.js     # agrupamento e barras de gastos
    ├── data/
    │   └── categorias.json   # fonte única das categorias (servidor + cliente)
    └── images/               # ilustrações SVG originais do projeto
```

## ▶️ Como rodar localmente

Pré-requisitos: [Node.js](https://nodejs.org/) instalado (versão 18 ou superior).

```bash
# 1. instale as dependências
npm install

# 2. inicie o servidor
npm start
# ou, durante o desenvolvimento, com recarregamento automático:
npm run devStart

# 3. abra no navegador
http://localhost:3000
```

## ☁️ Como publicar no CodeSandbox

1. Crie um novo sandbox a partir de um template **Node.js**.
2. Envie (ou importe via GitHub) todos os arquivos deste projeto.
3. O CodeSandbox roda `npm install` automaticamente; confirme que o `package.json`
   está na raiz do projeto.
4. O servidor escuta em `process.env.PORT || 3000`, compatível com a porta que o
   CodeSandbox injeta automaticamente.
5. Compartilhe o link do sandbox com o e-mail solicitado no seminário.

## 🗄️ Sobre o uso do localStorage

A tabela de transações é o coração do projeto. Toda a lógica de CRUD vive em
`public/js/storage.js` e `public/js/transacoes.js`:

- `MeuBolso.obterTransacoes()` — lê e faz `JSON.parse` da lista salva.
- `MeuBolso.adicionarTransacao(dados)` — gera um id e adiciona à lista.
- `MeuBolso.atualizarTransacao(id, dados)` — localiza pelo id e sobrescreve.
- `MeuBolso.removerTransacao(id)` — filtra a lista removendo o item.
- A busca textual filtra o array em memória (sem round-trip com o servidor)
  antes de re-renderizar as linhas da tabela.

Como os dados moram no navegador, **cada navegador/dispositivo tem seu próprio
histórico** — isso está documentado na página "Sobre" para o usuário final.

## 📄 Licença

Projeto de uso educacional, livre para estudo e adaptação.
