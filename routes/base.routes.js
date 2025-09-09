const express = require("express");
const router = express.Router();
const homeController = require("../controllers/home.controller");
const { checkSession } = require("../middlewares/session.middleware");

// Home Controller 
router.get("/", checkSession, homeController.getHomePage);
router.get("/health", checkSession, homeController.getHealth);

module.exports = router;
