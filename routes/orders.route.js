const express = require("express");
const orderController = require("../controllers/orders.controller");
const router = express.Router();

// router.get("/all", orderController.fetchAll);
router.get("/find-by-id/:id", orderController.findById);

module.exports = router;
