const express = require("express")
const router = express.Router()

router.get("/", (req, res) => {
  res.render("sobre", {
    titulo: "Sobre",
    pagina: "sobre",
    enviado: req.query.enviado === "1",
    erro: null,
    valoresAntigos: {},
  })
})

router.post("/", (req, res) => {
  const nome = (req.body.nome || "").trim()
  const email = (req.body.email || "").trim()
  const mensagem = (req.body.mensagem || "").trim()

  const emailValido = /.+@.+\..+/.test(email)

  if (!nome || !emailValido || !mensagem) {
    return res.render("sobre", {
      titulo: "Sobre",
      pagina: "sobre",
      enviado: false,
      erro: "Preencha nome, um e-mail válido e a mensagem antes de enviar.",
      valoresAntigos: { nome, email, mensagem },
    })
  }

  // Em um projeto real, aqui salvaríamos em banco de dados ou enviaríamos
  // um e-mail. Para este trabalho, apenas confirmamos o recebimento.
  console.log("Nova mensagem de contato:", { nome, email, mensagem })

  res.redirect("/sobre?enviado=1")
})

module.exports = router
