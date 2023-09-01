const express = require("express");
const userController = require("../controllers/users.controller");
const Validator = require("../middleware/validator");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();

router.post("/sign-up", Validator.userValidator, userController.signUp);
router.get("/log-in", userController.logIn);

router.get("/get-my-orders/:id", userController.findOrdersOfUser);

module.exports = router;
