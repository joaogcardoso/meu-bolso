module.exports = {
  content: ["./src/views/**/*.ejs", "./src/public/js/**/*.js"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 16px 40px rgb(15 23 42 / 0.08)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  daisyui: {
    themes: [
      {
        meubolso: {
          primary: "#2563eb",
          "primary-content": "#ffffff",
          secondary: "#475569",
          accent: "#0f766e",
          neutral: "#1f2937",
          "base-100": "#ffffff",
          "base-200": "#f6f7fb",
          "base-300": "#d9e0ea",
          "base-content": "#172033",
          info: "#0284c7",
          success: "#15803d",
          warning: "#b45309",
          error: "#b91c1c",
        },
      },
    ],
  },
};
