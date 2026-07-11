const { defineConfig } = require("vitest/config");

module.exports = defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    coverage: {
      reporter: ["text", "html"],
      include: ["src/public/js/core/*.js", "src/validators/*.js", "src/services/*.js"],
    },
  },
});
