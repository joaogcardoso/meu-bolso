const path = require("path");

const ROOT_DIR = path.join(__dirname, "..", "..");
const SRC_DIR = path.join(ROOT_DIR, "src");

module.exports = {
  root: ROOT_DIR,
  src: SRC_DIR,
  views: path.join(SRC_DIR, "views"),
  public: path.join(SRC_DIR, "public"),
  data: path.join(SRC_DIR, "public", "data"),
};
