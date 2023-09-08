const express = require("express");
const cartController = require("../controllers/cart.controller");

const router = express.Router();

router.patch("/add-product", cartController.addToCart);
router.patch("/remove-product", cartController.removeFromCart);
router.post("/checkout", cartController.checkoutCart);

module.exports = router;
