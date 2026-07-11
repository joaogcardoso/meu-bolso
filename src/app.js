const express = require("express");
const helmet = require("helmet");
const paths = require("./config/paths");
const indexRoutes = require("./routes/index.routes");
const transactionsRoutes = require("./routes/transactions.routes");
const categoriesRoutes = require("./routes/categories.routes");
const reportsRoutes = require("./routes/reports.routes");
const aboutRoutes = require("./routes/about.routes");
const notFound = require("./middlewares/not-found.middleware");
const errorMiddleware = require("./middlewares/error.middleware");

function createApp() {
  const app = express();

  app.disable("x-powered-by");

  app.set("view engine", "ejs");
  app.set("views", paths.views);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'"],
          imgSrc: ["'self'", "data:"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
        },
      },
    }),
  );

  app.use(express.urlencoded({ extended: false, limit: "50kb" }));
  app.use(express.json({ limit: "50kb" }));

  app.use(
    express.static(paths.public, {
      etag: true,
      maxAge: "1h",
    }),
  );

  app.use("/", indexRoutes);
  app.use("/transacoes", transactionsRoutes);
  app.use("/categorias", categoriesRoutes);
  app.use("/relatorios", reportsRoutes);
  app.use("/sobre", aboutRoutes);

  app.use(notFound);
  app.use(errorMiddleware);

  return app;
}

module.exports = createApp;
