const express = require("express");
const asyncHandler = require("../utils/async-handler");
const categoriesController = require("../controllers/categories.controller");

const router = express.Router();

router.get("/", asyncHandler(categoriesController.showCategories));

module.exports = router;
