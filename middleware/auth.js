const jsonwebtoken = require("jsonwebtoken");
const HTTP_STATUS = require("../constants/statusCode");
const { failure } = require("../utils/common");

const isAuthenticated = (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .send(failure("Unauthorized access"));
    }
    const jwt = req.headers.authorization.split(" ")[1];
    const validate = jsonwebtoken.verify(jwt, process.env.TOKEN_SECRET);
    if (validate) {
      next();
    } else {
      throw new Error();
    }
  } catch (error) {
    console.log(error);
    if (error instanceof jsonwebtoken.JsonWebTokenError) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .send(failure("Token invalid"));
    }
    if (error instanceof jsonwebtoken.TokenExpiredError) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .send(failure("Please log in again"));
    }
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Something went wrong"));
  }
};

const isAdmin = (req, res, next) => {
  try {
    const jwt = req.headers.authorization.split(" ")[1];
    const validate = jsonwebtoken.decode(jwt);
    // console.log("validate ", validate);
    if (validate.role === 1) {
      next();
    } else {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .send(failure("Unauthorized access"));
    }
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Something went wrong"));
  }
};

module.exports = { isAuthenticated, isAdmin };
