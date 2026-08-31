const express = require("express");
const router = express.Router();
const authController = require("../../controllers/auth/auth.controller");

//auth middleware
const { authenticateToken } = require("../../middleware/auth.middleware");

router.post("/auth/login-firebase-auth", authenticateToken, authController.loginWithFirebaseAuth);

module.exports = router;