const jwt = require("jsonwebtoken");
const { promisify } = require("util");

module.exports = async (req, res, next) => {
  try {
    //1
    const token = req.headers?.authorization?.split(" ")[1];

    // console.log(token);

    //2
    if (!token) {
      return res.status(401).json({
        status: "fail",
        error: "You are not logged in.",
      });
    }

    //3
    const decoded = await promisify(jwt.verify)(
      token,
      process.env.TOKEN_SECRET
    );

    //4
    req.user = decoded;
    // console.log(req.user);

    next();
  } catch (error) {
    return res.status(403).json({
      status: "fail",
      message: "invalid token",
    });
  }
};
