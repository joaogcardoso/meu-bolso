const express = require("express")
const router = express.Router()

router.get("/", (req, res) => {
  const hora = new Date().getHours()

  // Renderização condicional no servidor: saudação de acordo com o horário
  let saudacao
  if (hora < 12) {
    saudacao = "Bom dia"
  } else if (hora < 18) {
    saudacao = "Boa tarde"
  } else {
    saudacao = "Boa noite"
  }

  res.render("index", {
    titulo: "Início",
    pagina: "inicio",
    saudacao,
  })
})

module.exports = router
