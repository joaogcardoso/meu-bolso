const express = require("express")
const path = require("path")

const app = express()

// ----- Middlewares -----
app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// ----- View engine -----
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

// ----- Rotas -----
const indexRouter = require("./routes/index")
const transacoesRouter = require("./routes/transacoes")
const categoriasRouter = require("./routes/categorias")
const relatoriosRouter = require("./routes/relatorios")
const sobreRouter = require("./routes/sobre")

app.use("/", indexRouter)
app.use("/transacoes", transacoesRouter)
app.use("/categorias", categoriasRouter)
app.use("/relatorios", relatoriosRouter)
app.use("/sobre", sobreRouter)

// ----- 404 -----
app.use((req, res) => {
  res.status(404).render("404", { url: req.originalUrl })
})

const PORT = process.env.PORT || 3030
app.listen(PORT, () => {
  console.log(`Meu Bolso rodando em http://localhost:${PORT}`)
})
