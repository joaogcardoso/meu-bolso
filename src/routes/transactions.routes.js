const express = require("express");
const asyncHandler = require("../utils/async-handler");
const pagesController = require("../controllers/pages.controller");

const router = express.Router();

router.get("/", asyncHandler(pagesController.transactions));

module.exports = router;
