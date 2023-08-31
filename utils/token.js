const jwt = require("jsonwebtoken");
exports.generateToken = (userInfo) => {
  //   console.log("userInfo ", userInfo);
  const payload = {
    email: userInfo.email,
  };
  //   console.log("payload =>>>>>> ", payload);
  // console.log('TOKEN_SECRET ', process.env.TOKEN_SECRET);
  const token = jwt.sign(payload, process.env.TOKEN_SECRET, {
    expiresIn: "10h",
  });
  return token;
};
