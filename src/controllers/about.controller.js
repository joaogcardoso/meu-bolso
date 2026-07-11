const { renderPage } = require("./pages.controller");
const { validateContact } = require("../validators/contact.validator");

function showAbout(req, res) {
  return renderPage(res, "about", {
    title: "Sobre",
    currentPage: "about",
    contact: {
      values: {},
      errors: {},
      success: req.query.sent === "1",
    },
  });
}

function sendContact(req, res) {
  const validation = validateContact(req.body);

  if (!validation.isValid) {
    return renderPage(
      res,
      "about",
      {
        title: "Sobre",
        currentPage: "about",
        contact: {
          values: validation.values,
          errors: validation.errors,
          success: false,
          message: "Corrija os campos destacados antes de enviar.",
        },
      },
      422,
    );
  }

  return res.redirect("/sobre?sent=1");
}

module.exports = {
  showAbout,
  sendContact,
};
