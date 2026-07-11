const categoriesService = require("../services/categories.service");

function renderPage(res, page, viewModel = {}, statusCode = 200) {
  return res.status(statusCode).render("layouts/main", {
    ...viewModel,
    pageView: `../pages/${page}`,
  });
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Bom dia";
  }

  if (hour < 18) {
    return "Boa tarde";
  }

  return "Boa noite";
}

function home(req, res) {
  return renderPage(res, "index", {
    title: "Início",
    currentPage: "home",
    greeting: getGreeting(),
  });
}

async function transactions(req, res) {
  const [categories, categoryStatus] = await Promise.all([
    categoriesService.getCategories(),
    categoriesService.getCategoryStatus(),
  ]);

  return renderPage(res, "transactions", {
    title: "Transações",
    currentPage: "transactions",
    categories,
    categoryStatus,
    today: new Date().toISOString().slice(0, 10),
  });
}

async function reports(req, res) {
  const categories = await categoriesService.getCategories();

  return renderPage(res, "reports", {
    title: "Relatórios",
    currentPage: "reports",
    categories,
  });
}

module.exports = {
  renderPage,
  home,
  transactions,
  reports,
};
