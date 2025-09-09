const express = require("express");
const router = express.Router();
const loginController = require("../controllers/login.controller");
const { checkSession } = require("../middlewares/session.middleware");

router.get("/", checkSession, loginController.getLoginPage);
router.get("/login", loginController.getLoginPage);
router.get("/status", loginController.getStatus);
router.post("/submit-password", loginController.submitPassword);

module.exports = router;
