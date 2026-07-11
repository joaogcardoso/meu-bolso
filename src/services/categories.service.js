const fs = require("fs/promises");
const path = require("path");
const paths = require("../config/paths");

const categoriesFile = path.join(paths.data, "categorias.json");
let cachedCategories = null;
let loadError = null;

function normalizeCategory(category) {
  return {
    id: String(category.id || "").trim(),
    name: String(category.name || category.nome || "").trim(),
    type: String(category.type || category.tipo || "").trim(),
    description: String(category.description || category.descricao || "").trim(),
  };
}

function validateCategories(categories) {
  if (!Array.isArray(categories)) {
    throw new Error("Categories file must contain an array.");
  }

  const ids = new Set();

  return categories.map(normalizeCategory).filter((category) => {
    const valid =
      category.id &&
      category.name &&
      (category.type === "income" ||
        category.type === "expense" ||
        category.type === "receita" ||
        category.type === "despesa");

    if (!valid || ids.has(category.id)) {
      return false;
    }

    ids.add(category.id);
    return {
      ...category,
      type: category.type === "receita" ? "income" : category.type === "despesa" ? "expense" : category.type,
    };
  });
}

async function loadCategories() {
  try {
    const content = await fs.readFile(categoriesFile, "utf8");
    const parsed = JSON.parse(content);
    cachedCategories = validateCategories(parsed).map((category) => ({
      ...category,
      type: category.type === "receita" ? "income" : category.type === "despesa" ? "expense" : category.type,
    }));
    loadError = null;
  } catch (error) {
    cachedCategories = [];
    loadError = error;
    if (process.env.NODE_ENV !== "test") {
      console.error("Failed to load categories data:", error.message);
    }
  }
}

/**
 * Returns categories loaded from the static JSON file.
 * The file is read lazily and cached to avoid synchronous I/O during requests.
 *
 * @returns {Promise<Array<Object>>} Normalized categories.
 */
async function getCategories() {
  if (!cachedCategories) {
    await loadCategories();
  }

  return cachedCategories;
}

/**
 * Returns the current loading status for the categories file.
 *
 * @returns {Promise<{hasError: boolean, message: string|null}>} Status consumed by views.
 */
async function getCategoryStatus() {
  if (!cachedCategories) {
    await loadCategories();
  }

  return {
    hasError: Boolean(loadError),
    message: loadError ? "Não foi possível carregar as categorias padrão." : null,
  };
}

function resetCategoriesCache() {
  cachedCategories = null;
  loadError = null;
}

module.exports = {
  getCategories,
  getCategoryStatus,
  resetCategoriesCache,
};
