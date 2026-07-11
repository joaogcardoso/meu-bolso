const categoriesService = require("../services/categories.service");
const { renderPage } = require("./pages.controller");

async function showCategories(req, res) {
  const [categories, categoryStatus] = await Promise.all([
    categoriesService.getCategories(),
    categoriesService.getCategoryStatus(),
  ]);

  return renderPage(res, "categories", {
    title: "Categorias",
    currentPage: "categories",
    categories,
    categoryStatus,
  });
}

module.exports = {
  showCategories,
};
