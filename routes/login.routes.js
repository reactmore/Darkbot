const express = require("express");
const router = express.Router();
const loginController = require("../controllers/login.controller");
const homeController = require("../controllers/home.controller");
const { checkSession } = require("../middlewares/session.middleware");

// Login Controller 
router.get("/login", checkSession, loginController.getLoginPage);
router.get("/status", checkSession, loginController.getStatus);
router.get("/qr", loginController.getQr);
router.post("/submit-password", loginController.submitPassword);

module.exports = router;
