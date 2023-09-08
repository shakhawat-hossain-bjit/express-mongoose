const express = require("express");
const app = express();
var cookieParser = require("cookie-parser");
var cors = require("cors");

const dotenv = require("dotenv");
const productRouter = require("./routes/products.route");
const userRouter = require("./routes/users.route");
const authRouter = require("./routes/auth.route");
const orderRouter = require("./routes/orders.route");
const cartRouter = require("./routes/carts.route");
const { failure, success } = require("./utils/common");
const databaseConnection = require("./db/config");
dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    console.log(err);
    return res.status(400).send(failure("Invalid JSON provided"));
  }
  next();
});

app.use("/products", productRouter);
app.use("/users", userRouter);
app.use("/auth", authRouter);
app.use("/orders", orderRouter);
app.use("/cart", cartRouter);

app.get("/", (req, res) => {
  return res.status(200).send(success("Hello world"));
});
app.use("*", (req, res) => {
  return res.status(400).send(failure("There is no such route"));
});

databaseConnection(() => {
  app.listen(8000, () => {
    // console.log(process.env.MY_SECRET_KEY);
    let date = new Date();
    console.log(
      `App is running on port 8000 ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} `
    );
  });
});
