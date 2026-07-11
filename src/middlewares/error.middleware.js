function errorMiddleware(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (process.env.NODE_ENV !== "test") {
    console.error("Unhandled application error:", error.message);
  }

  return res.status(500).render("layouts/main", {
    title: "Erro interno",
    currentPage: "",
    pageView: "../errors/500",
  });
}

module.exports = errorMiddleware;
