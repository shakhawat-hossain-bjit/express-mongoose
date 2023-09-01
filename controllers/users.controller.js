const Order = require("../models/Order");
const User = require("../models/User");
const { insertInLog } = require("../server/logFile");
const { success, failure } = require("../utils/common");
const { generateToken } = require("../utils/token");
var cookieParser = require("cookie-parser");

class UserController {
  signUp = async (req, res) => {
    try {
      const newUser = req.body;
      let result = await User.createUser(newUser);
      let logFileResult = await insertInLog("SIGN_UP", newUser?.email);
      // console.log(result);
      if (result.success) {
        return res.status(200).send(
          success("successfully registered the user", {
            id: result.id,
            email: newUser.email,
          })
        );
      } else {
        return res.status(400).send(failure("failed to register"));
      }
    } catch (error) {
      console.log(error);
      return res.status(400).send(failure("Internal error occured"));
    }
  };

  logIn = async (req, res) => {
    try {
      const user = req.body;
      let result = await User.logInUser(user);
      let logFileResult = await insertInLog("LOG_IN", user?.email);
      let token = generateToken({ email: user.email });
      console.log(token);
      res.cookie("token", token, {
        maxAge: 20 * 60 * 1000,
        httpOnly: true,
        secure: true,
      });

      // console.log(result);
      if (result.success) {
        return res
          .status(200)
          .send(success("successfully logged in", { email: user.email }));
      } else {
        return res.status(400).send(failure("failed to log in"));
      }
    } catch (error) {
      console.log(error);
      return res.status(400).send(failure("Internal error occured"));
    }
  };

  findOrdersOfUser = async (req, res) => {
    const { id } = req.params;
    console.log(id);
    if (id) {
      try {
        let result = await Order.find({ customerId: id })
          .populate("products.productId")
          .populate("customerId");
        console.log(result);
        let logFileResult = await insertInLog("GET_ORDERS_FOR_USER", id);

        if (result?.length)
          return res
            .status(200)
            .send(success("Successfully fetched the data", result));
        else
          return res
            .status(404)
            .send(failure("There is no such data with this ID"));
      } catch (error) {
        console.log("error ", error);
        return res.status(400).send(failure("Internal error occured"));
      }
    }
  };
}

module.exports = new UserController();
