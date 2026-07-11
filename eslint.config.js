const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  {
    ignores: ["node_modules/**", "coverage/**", "src/public/css/app.css"],
  },
  js.configs.recommended,
  {
    files: ["src/**/*.js", "tests/**/*.js", "*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      "no-console": ["error", { allow: ["info", "error"] }],
    },
  },
  {
    files: ["tests/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.vitest,
      },
    },
  },
];
