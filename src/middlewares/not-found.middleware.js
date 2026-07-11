function notFound(req, res) {
  res.status(404).render("layouts/main", {
    title: "Página não encontrada",
    currentPage: "",
    pageView: "../errors/404",
    requestedUrl: req.originalUrl,
  });
}

module.exports = notFound;
