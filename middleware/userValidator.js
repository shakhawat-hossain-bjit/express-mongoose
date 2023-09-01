const { body, query, param } = require("express-validator");

const productValidator = {
  update_profile_Validator: [
    body("firstName")
      .exists()
      .withMessage("Title was not provided")
      .bail()

      .notEmpty()
      .withMessage("First Name cannot be empty")
      .bail()

      .isString()
      .withMessage("First Name must be a string")
      .isLength({ min: 5, max: 20 })
      .withMessage(
        "First Name must be less than 20 characters, and more than 5 characters"
      ),
    body("lastName")
      .exists()
      .withMessage("Title was not provided")
      .bail()

      .notEmpty()
      .withMessage("Last Name cannot be empty")
      .bail()

      .isString()
      .withMessage("Last Name must be a string")
      .isLength({ min: 5, max: 20 })
      .withMessage(
        "Last Name must be less than 20 characters, and more than 5 characters"
      ),
    body("age")
      .isString()
      .withMessage("Description must be a string")
      .isLength({ min: 5, max: 200 })
      .withMessage(
        "Description must be less than 200 characters, and more than 50 characters"
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
  create_user_validator: [
    body("email")
      .notEmpty()
      .withMessage("email cannot be empty")
      .bail()
      .isString()
      .withMessage("Email must be a string"),
    body("password")
      .isNumeric()
      .withMessage("Price must be numeric")
      .custom((value) => {
        if (value <= 0) {
          throw new Error("Price cannot be 0 or negative");
        }
        return true;
      }),
    body("confirmPassword")
      .isNumeric()
      .withMessage("Stock must be numeric")
      .bail()
      .custom((value) => {
        if (value <= 0) {
          throw new Error("Stock cannot be 0 or negative");
        }
        return true;
      }),
  ],
};

module.exports = productValidator;
