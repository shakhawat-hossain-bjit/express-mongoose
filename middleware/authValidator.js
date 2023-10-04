const { body, query, param } = require("express-validator");

const authValidator = {
  addUserValidatior: [
    body("email")
      .exists()
      .withMessage("Email must be provided")
      .bail()
      .isEmail()
      .withMessage("Invalid email address"),

    body("password")
      .exists()
      .withMessage("Password was not provided")
      .bail()
      .notEmpty()
      .withMessage("Password cannot be empty")
      .bail()
      // .isStrongPassword({
      //   minLength: 8,
      //   minLowercase: 1,
      //   minUppercase: 1,
      // })
      // .withMessage(
      //   "Password minimum length 8, with 1 lower case, 1 upper case and 1 number"
      // )
      // .bail(),
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
      .withMessage(
        "Password minimum length 8, with 1 lower case, 1 upper case and 1 number"
      )
      .bail(),

    body("phone").isNumeric().withMessage("Phone must be a number"),
    body("userName")
      .exists()
      .withMessage("userName must be provided")
      .bail()

      .notEmpty()
      .withMessage("userName cannot be empty")
      .bail()

      .isString()
      .withMessage("userName must be a string")
      .isLength({ min: 5, max: 20 })
      .withMessage(
        "userName must not less than 5 characters, and more than 20 characters"
      ),
  ],
};

module.exports = authValidator;
