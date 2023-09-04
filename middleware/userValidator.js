const { body, query, param } = require("express-validator");

const userValidator = {
  updateUserValidator: [
    body("firstName")
      .exists()
      .withMessage("First Name was not provided")
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
      .withMessage("Last Name was not provided")
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
      .isNumeric()
      .withMessage("Age must be a number")
      .isLength({ min: 12, max: 100 })
      .withMessage("Age must be in range 12 to 100 "),
    body("email")
      .exists()
      .withMessage("Email must be provided")
      .bail()
      .isEmail()
      .withMessage("Invalid email address"),
  ],
};

module.exports = productValidator;
