const express = require("express");
const aboutController = require("../controllers/about.controller");

const router = express.Router();

router.get("/", aboutController.showAbout);
router.post("/", aboutController.sendContact);

module.exports = router;
