const { body, query, param } = require("express-validator");

const productValidator = {
  create_product_Validator: [
    body("title")
      .exists()
      .withMessage("Title was not provided")
      .bail()

      .notEmpty()
      .withMessage("Title cannot be empty")
      .bail()

      .isString()
      .withMessage("Title must be a string")
      .isLength({ min: 5, max: 30 })
      .withMessage(
        "Title must be less than 50 characters, and more than 5 characters"
      ),
    body("description")
      .exists()
      .withMessage("Description was not provided")
      .bail()

      .notEmpty()
      .withMessage("Description cannot be empty")
      .bail()

      .isString()
      .withMessage("Description must be a string")
      .isLength({ min: 5, max: 200 })
      .withMessage(
        "Description must be less than 200 characters, and more than 5 characters"
      ),
    body("price")
      .exists()
      .withMessage("Price was not provided")
      .bail()
      .isNumeric()
      .withMessage("Price must be numeric")
      .custom((value) => {
        if (value <= 0) {
          throw new Error("Price cannot be 0 or negative");
        }
        return true;
      }),
    body("stock")
      .exists()
      .withMessage("Stock was not provided")
      .bail()
      .isNumeric()
      .withMessage("Stock must be numeric")
      .bail()
      .custom((value) => {
        if (value <= 0) {
          throw new Error("Stock cannot be 0 or negative");
        }
        return true;
      }),
    body("rating")
      .exists()
      .withMessage("Rating was not provided")
      .bail()
      .isNumeric()
      .withMessage("Rating must be numeric")
      .bail()
      .isFloat({ min: 0, max: 5 })
      .withMessage("Rating must be between 0 and 5"),
  ],
  update_product_Validator: [
    body("title")
      .notEmpty()
      .withMessage("Title cannot be empty")
      .bail()
      .isString()
      .withMessage("Title must be a string")
      .isLength({ min: 5, max: 50 })
      .withMessage(
        "Title must be less than 50 characters, and more than 5 characters"
      ),
    body("price")
      .isNumeric()
      .withMessage("Price must be numeric")
      .custom((value) => {
        if (value <= 0) {
          throw new Error("Price cannot be 0 or negative");
        }
        return true;
      }),
    body("stock")
      .isNumeric()
      .withMessage("Stock must be numeric")
      .bail()
      .custom((value) => {
        if (value <= 0) {
          throw new Error("Stock cannot be 0 or negative");
        }
        return true;
      }),
    body("rating")
      .isNumeric()
      .withMessage("Rating must be numeric")
      .bail()
      .isFloat({ min: 0, max: 5 })
      .withMessage("Rating must be between 0 and 5"),
    param("id")
      .exists()
      .withMessage("Product ID must be provided")
      .bail()
      .matches(/^[a-f\d]{24}$/i)
      .withMessage("ID is not in valid mongoDB format"),
  ],
  delete_product_Validator: [
    param("id")
      .exists()
      .withMessage("Product ID must be provided")
      .bail()
      .matches(/^[a-f\d]{24}$/i)
      .withMessage("ID is not in valid mongoDB format"),
  ],
};

module.exports = productValidator;
