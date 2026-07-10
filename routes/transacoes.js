const express = require("express")
const fs = require("fs")
const path = require("path")
const router = express.Router()

const categoriasPath = path.join(__dirname, "..", "public", "data", "categorias.json")

router.get("/", (req, res) => {
  const categorias = JSON.parse(fs.readFileSync(categoriasPath, "utf-8"))
  const hoje = new Date().toISOString().slice(0, 10)

  res.render("transacoes", {
    titulo: "Transações",
    pagina: "transacoes",
    categorias,
    hoje,
  })
})

module.exports = router
