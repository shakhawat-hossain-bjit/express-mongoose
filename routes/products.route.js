const express = require("express");
const ProductController = require("../controllers/products.controller");
const Validator = require("../middleware/validator");
const productValidator = require("../middleware/productValidator");
const verifyToken = require("../middleware/verifyToken");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/all", ProductController.fetchAll);
router.get("/find-by-id/:id", ProductController.findById);
router.post(
  "/insert",
  // isAuthenticated,
  // isAdmin,
  productValidator.create_product_Validator,
  ProductController.postData
);
router.patch(
  "/update/:id",
  productValidator.update_product_Validator,
  ProductController.updateData
);
router.delete("/delete/:id", ProductController.deleteOne);

// router.patch("/update/:id", verifyToken, ProductController.updateData);

module.exports = router;
