const express = require("express")
const fs = require("fs")
const path = require("path")
const router = express.Router()

const categoriasPath = path.join(__dirname, "..", "public", "data", "categorias.json")

function lerCategorias() {
  return JSON.parse(fs.readFileSync(categoriasPath, "utf-8"))
}

// Sugestões feitas pelo formulário ficam apenas na memória do servidor
// (reiniciam quando o servidor reinicia) — servem para demonstrar uma
// rota POST do Express com validação e renderização condicional.
const sugestoes = []

router.get("/", (req, res) => {
  res.render("categorias", {
    titulo: "Categorias",
    pagina: "categorias",
    categorias: lerCategorias(),
    sugestoes,
    erro: null,
    enviado: false,
    valoresAntigos: {},
  })
})

router.post("/", (req, res) => {
  const nome = (req.body.nome || "").trim()
  const tipo = req.body.tipo

  const tipoValido = tipo === "receita" || tipo === "despesa"

  if (!nome || nome.length < 3 || !tipoValido) {
    return res.render("categorias", {
      titulo: "Categorias",
      pagina: "categorias",
      categorias: lerCategorias(),
      sugestoes,
      erro: "Informe um nome com pelo menos 3 letras e escolha se é receita ou despesa.",
      enviado: false,
      valoresAntigos: { nome, tipo },
    })
  }

  sugestoes.push({ nome, tipo })

  res.render("categorias", {
    titulo: "Categorias",
    pagina: "categorias",
    categorias: lerCategorias(),
    sugestoes,
    erro: null,
    enviado: true,
    valoresAntigos: {},
  })
})

module.exports = router
