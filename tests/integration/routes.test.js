const fs = require("fs/promises");
const path = require("path");
const request = require("supertest");
const createApp = require("../../src/app");
const paths = require("../../src/config/paths");
const categoriesService = require("../../src/services/categories.service");

const categoriesPath = path.join(paths.data, "categorias.json");
let originalCategories = null;

describe("application routes", () => {
  afterEach(async () => {
    if (originalCategories !== null) {
      await fs.writeFile(categoriesPath, originalCategories, "utf8");
      originalCategories = null;
      categoriesService.resetCategoriesCache();
    }
  });

  it("renders main pages", async () => {
    const app = createApp();

    await request(app).get("/").expect(200);
    await request(app).get("/transacoes").expect(200);
    await request(app).get("/categorias").expect(200);
    await request(app).get("/relatorios").expect(200);
    await request(app).get("/sobre").expect(200);
  });

  it("renders a controlled 404 page", async () => {
    const app = createApp();
    const response = await request(app).get("/rota-inexistente").expect(404);

    expect(response.text).toContain("Página não encontrada");
  });

  it("validates contact form and preserves values after error", async () => {
    const app = createApp();
    const response = await request(app)
      .post("/sobre")
      .type("form")
      .send({ name: "A", email: "invalido", message: "curta" })
      .expect(422);

    expect(response.text).toContain("Corrija os campos destacados");
    expect(response.text).toContain("Informe um e-mail válido");
  });

  it("redirects after a valid contact form", async () => {
    const app = createApp();

    await request(app)
      .post("/sobre")
      .type("form")
      .send({
        name: "Ana",
        email: "ana@example.com",
        message: "Mensagem com conteúdo suficiente.",
      })
      .expect(302)
      .expect("Location", "/sobre?sent=1");
  });

  it("keeps categories pages controlled when categories JSON is invalid", async () => {
    originalCategories = await fs.readFile(categoriesPath, "utf8");
    await fs.writeFile(categoriesPath, "{invalid", "utf8");
    categoriesService.resetCategoriesCache();

    const app = createApp();
    const response = await request(app).get("/categorias").expect(200);

    expect(response.text).toContain("Não foi possível carregar as categorias padrão");
  });
});
