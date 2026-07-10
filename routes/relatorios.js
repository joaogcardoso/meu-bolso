const express = require("express")
const router = express.Router()

router.get("/", (req, res) => {
  res.render("relatorios", {
    titulo: "Relatórios",
    pagina: "relatorios",
  })
})

module.exports = router
