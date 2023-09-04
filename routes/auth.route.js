const express = require("express");
const authController = require("../controllers/auth.controller");
const authValidator = require("../middleware/authValidator");
const router = express.Router();

router.post("/sign-up", authValidator.addUserValidatior, authController.signUp);
router.post("/log-in", authController.logIn);

module.exports = router;
