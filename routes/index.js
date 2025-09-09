const express = require("express");
const router = express.Router();

const baseRoutes = require("./base.routes");
const loginRoutes = require("./login.routes");

router.use("/", baseRoutes);

router.use("/auth", loginRoutes);

module.exports = router;
