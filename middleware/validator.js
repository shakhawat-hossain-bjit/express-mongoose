const User = require("../models/User");
const { failure } = require("../utils/common");
const fs = require("fs");
const path = require("path");
const fsPromise = require("fs").promises;

class Validator {
  productValidator = async (req, res, next) => {
    let newProduct = req.body;
    let error = {};
    if (newProduct.hasOwnProperty("id")) {
      error.id = "Id should not be passed in body";
    }
    if (
      !newProduct.hasOwnProperty("title") ||
      newProduct?.title?.toString().trim() == ""
    ) {
      error.title =
        "title should be passed to create a product and it must have some values";
    }

    if (!newProduct.hasOwnProperty("price") || isNaN(newProduct.price)) {
      error.price =
        "price should  be passed to create a product and it must be number type";
    }
    if (
      !newProduct.hasOwnProperty("stock") ||
      isNaN(newProduct.stock) ||
      !Number.isInteger(Number(newProduct.stock))
    ) {
      error.stock =
        "stock should  be passed to create a product and it must be integer type";
    }

    if (newProduct.hasOwnProperty("rating")) {
      // console.log(newProduct?.rating);
      // console.log("second ", newProduct?.rating);
      if (
        isNaN(newProduct.rating) ||
        newProduct.rating < 0 ||
        newProduct.rating > 5
      ) {
        error.rating = "rating should be in range 0.00~5.00";
      }
    }

    req.error = error;
    req.newProduct = newProduct;
    next();
  };

  userValidator = async (req, res, next) => {
    let userData = req.body;
    let error = {};
    if (!userData?.hasOwnProperty("email")) {
      error.email = "Email is not provided";
    }
    if (!userData?.hasOwnProperty("password")) {
      error.password = "Password is not provided";
    }
    if (!userData?.hasOwnProperty("confirmPassword")) {
      error.confirmPassword = "confirm password is not provided";
    }
    if (
      userData?.hasOwnProperty("confirmPassword") &&
      userData?.hasOwnProperty("confirmPassword") &&
      userData.password != userData?.confirmPassword
    ) {
      error.confirmPassword = "confirm password not matched";
    }

    if (Object.keys(error).length > 0) {
      return res
        .status(400)
        .send(failure("Data is not provided as per requirement", error));
    }
    req.body = { ...userData, email: userData.email.toLowerCase() };
    // console.log(req.body);
    next();
  };

  // reading file should be in User model.... need to place the code here
  checkIfEmailUsed = async (req, res, next) => {
    let email = req.body?.email?.toLowerCase();
    fsPromise
      .readFile(path.join(__dirname, "..", "data", "user.json"), {
        encoding: "utf-8",
      })
      .then((data) => {
        const jsonData = JSON.parse(data);
        const found = jsonData.find((x) => x.email == email);
        if (found) {
          res.status(422).send(failure("This email is already is use"));
        } else {
          next();
        }
      })
      .catch((error) => {
        return res.status(400).send(failure("Error occured"));
      });
  };
}

module.exports = new Validator();
