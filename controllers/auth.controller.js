const { validationResult } = require("express-validator");
const HTTP_STATUS = require("../constants/statusCode");
const Auth = require("../models/Auth");
const User = require("../models/User");
const { insertInLog } = require("../server/logFile");
const { success, failure } = require("../utils/common");
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/token");

class AuthController {
  signUp = async (req, res) => {
    try {
      /*checking if express validation (backend validation) failed*/
      const validation = validationResult(req).array();
      if (validation.length) {
        return res
          .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
          .send(failure("Invalid inputs provided", validation));
      }

      // console.log(req.body);
      let { email, password, phone, name } = req.body;
      email = email.toLowerCase().trim();
      name = name.toLowerCase().trim();

      /* check if emial and name available*/
      let findUser = await Auth.findOne({
        $or: [{ email: email }, { name: name }],
      });
      // console.log("findUser ", findUser);
      if (findUser?.email == email && findUser?.name == name) {
        return res
          .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
          .send(failure("This email and name is not available"));
      }
      if (findUser?.email == email) {
        return res
          .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
          .send(failure("This email is not available"));
      } else if (findUser?.name == name) {
        return res
          .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
          .send(failure("This user name is not available"));
      }

      let saltRounds = 10;
      password = await bcrypt.hash(password, saltRounds);
      let user = new User({
        email,
        phone,
        name,
        password,
      });

      /* saving the user info in the user collection */
      let result = await user.save();
      //   console.log(result);
      if (result?._id) {
        let auth = new Auth({
          email,
          password,
          phone,
          name,
          userId: result?._id,
        });
        /* saving the authentication info in the auth collection */
        let output = await auth.save();
        // console.log(output);
        const response = output.toObject();
        delete response.password;
        // console.log("response ", response);
        if (response?._id) {
          let logFileResult = await insertInLog("SIGN_UP", email);
          return res
            .status(HTTP_STATUS.OK)
            .send(success("successfully registered the user", response));
        } else {
          return res
            .status(HTTP_STATUS.NOT_ACCEPTABLE)
            .send(success("Sign Up failed"));
        }
      } else {
        return res
          .status(HTTP_STATUS.NOT_ACCEPTABLE)
          .send(failure("Failed to create the user"));
      }
    } catch (error) {
      console.log(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal error occured"));
    }
  };

  logIn = async (req, res) => {
    try {
      let { email, password } = req.body;
      email = email.toLowerCase().trim();
      let user = await Auth.findOne({ email: email })
        .populate("userId")
        .select("-createdAt -updatedAt");
      let flag = false;
      // console.log("user ", user);
      if (user?._id) {
        // compare password
        flag = await bcrypt.compare(password, user.password);
        // console.log(flag);
      }
      user.password = undefined;
      if (flag) {
        let logFileResult = await insertInLog("LOG_IN", email);
        const responseAuth = user.toObject();
        let token = generateToken(responseAuth);
        // console.log("token ", token);
        responseAuth.token = token;
        // console.log(user);
        return res
          .status(HTTP_STATUS.OK)
          .send(success("Successfully Logged In", responseAuth));
      } else {
        return res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .send(failure("Wrong email or password"));
      }
    } catch (error) {
      console.log(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal error occured"));
    }
  };
}

module.exports = new AuthController();
