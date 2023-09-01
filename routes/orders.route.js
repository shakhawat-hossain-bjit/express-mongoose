const express = require("express");
const orderController = require("../controllers/orders.controller");
const router = express.Router();

router.get("/all", orderController.getAllOrder);
router.get("/get-order-details/:id", orderController.getOrderById);

router.post("/insert", orderController.insertOne);

module.exports = router;
