const { validationResult } = require("express-validator");
const HTTP_STATUS = require("../constants/statusCode");
const Auth = require("../models/Auth");
const User = require("../models/User");
const { insertInLog } = require("../server/logFile");
const { success, failure } = require("../utils/common");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");

class CartController {
  addToCart = async (req, res) => {
    try {
      console.log("inside ", req.body);
      const { userId, productId, quantity } = req.body;

      if (isNaN(quantity) || parseInt(quantity) < 0) {
        return res
          .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
          .send(failure("Quantity is invalid"));
      }

      // check if cart exist for the user
      let result = await Cart.findOne({ customerId: userId })
        .populate("products.productId")
        .populate("customerId");

      let totalPrice = result?.totalPrice || 0;

      //cart exist for the user
      if (result?._id) {
        //cart created means that user is already valid
        // console.log("result ", result);
        //check if product exists in the result
        let productList = result?.products;
        let index = productList?.findIndex(
          (x) => x?.productId?._id == productId
        );

        let product = await Product.findOne({ _id: productId });
        if (!product) {
          return res
            .status(HTTP_STATUS.NOT_FOUND)
            .send(failure("There is no such product"));
        }

        console.log("index ", index);
        // product not exist in the cart previously
        if (index == -1) {
          // this product is new to cart
          if (product.stock < quantity) {
            return res
              .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
              .send(failure("The quantity must be less than or equal stock"));
          }
          let newProduct = { productId, quantity };
          totalPrice += product.price * parseInt(quantity);
          console.log("totalPrice ", totalPrice);
          await Cart.updateOne(
            { _id: result?._id },
            {
              $set: { totalPrice: totalPrice },
              $push: { products: newProduct },
            }
          );
          return res
            .status(HTTP_STATUS.OK)
            .send(success("Successfully added new product to the cart"));
        } else {
          // this product is already in the cart
          let current = productList[index].quantity;
          current += parseInt(quantity);
          console.log("current ", current);
          totalPrice += product.price * parseInt(quantity);
          console.log("totalPrice ", totalPrice);

          // check if it quantity greater than stock
          if (product.stock < current) {
            return res
              .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
              .send(failure("The quantity must be less than or equal stock"));
          }
          await Cart.updateOne(
            { _id: result?._id, "products.productId": productId },
            { $set: { "products.$.quantity": current, totalPrice: totalPrice } }
          );
          return res
            .status(HTTP_STATUS.OK)
            .send(success("Successfully updated product in the cart"));
        }
      } else {
        // check if the user exists
        let user = await User.findOne({ _id: userId });
        // console.log("user ", user);
        if (!user) {
          return res
            .status(HTTP_STATUS.NOT_FOUND)
            .send(failure("There is no such user"));
        }
        let product = await Product.findOne({ _id: productId });
        // console.log("product ", product);
        if (!product) {
          return res
            .status(HTTP_STATUS.NOT_FOUND)
            .send(failure("There is no such product"));
        }
        if (product.stock < quantity) {
          return res
            .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
            .send(failure("The quantity must be less than or equal stock"));
        }
        let products = [];
        products.push({ productId, quantity });
        // console.log("products ", products);
        totalPrice += product.price * parseInt(quantity);
        let output = await Cart.create({
          customerId: userId,
          products: products,
          totalPrice,
        });
        console.log("output ", output);
        if (output?._id) {
          return res
            .status(HTTP_STATUS.CREATED)
            .send(success("Successfully created the cart"));
        } else {
          return res
            .status(HTTP_STATUS.BAD_REQUEST)
            .send(failure("Failed to create the cart"));
        }
      }
    } catch (error) {
      console.log(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal error occured"));
    }
  };

  removeFromCart = async (req, res) => {
    try {
      const { userId, productId, quantity } = req.body;

      if (isNaN(quantity) || parseInt(quantity) < 0) {
        return res
          .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
          .send(failure("Quantity is invalid"));
      }

      // check if cart exist for the user
      let result = await Cart.findOne({ customerId: userId })
        .populate("products.productId")
        .populate("customerId");
      let totalPrice = result?.totalPrice || 0;
      if (!result) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("There is no such cart for the user"));
      }

      let product = await Product.findOne({ _id: productId });
      if (!product) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("There is no such product"));
      }

      let productList = result?.products;
      let index = productList?.findIndex((x) => x?.productId?._id == productId);
      if (index == -1) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("This product is not in the order"));
      }
      //   console.log("index ", index);
      let current = productList[index]?.quantity;
      current = current - parseInt(quantity);
      console.log("current ", current);
      if (current == 0) {
        totalPrice -= product.price * parseInt(quantity);
        console.log("totalPrice ", totalPrice);
        await Cart.updateOne(
          { customerId: userId },
          {
            $pull: { products: { productId: productId } },
            $set: {
              totalPrice: totalPrice,
            },
          }
        );

        return res
          .status(HTTP_STATUS.OK)
          .send(success("product is removed from the cart"));
      } else if (current > 0) {
        totalPrice -= product.price * parseInt(quantity);
        console.log("totalPrice ", totalPrice);
        await Cart.updateOne(
          { customerId: userId, "products.productId": productId },
          { $set: { "products.$.quantity": current, totalPrice: totalPrice } }
        );
        return res
          .status(HTTP_STATUS.OK)
          .send(
            success("Product is removed " + quantity + " times from the cart")
          );
      } else if (current < 0) {
        return res
          .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
          .send(failure("You can't remove a product more than it is added"));
      }
    } catch (error) {
      console.log(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal error occured"));
    }
  };

  checkoutCart = async (req, res) => {
    try {
      const { userId, productId, quantity } = req.body;
      let result = await Cart.findOne({ customerId: userId })
        .populate("products.productId")
        .populate("customerId");

      // console.log(result);
      if (!result) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("There is no cart for the user"));
      }

      let { products, totalPrice } = result;
      if (products.length) {
        let productList = result?.products;
        console.log(productList);

        const filteredProducts = [];

        await Promise.all(
          productList.map(async (x) => {
            if (x?.productId?._id) {
              let product = await Product.findOne({ _id: x?.productId?._id });
              if (x?.quantity <= product?.stock) {
                let newStock = product?.stock - x?.quantity;
                await Product.updateOne(
                  { _id: x?.productId?._id },
                  {
                    $set: {
                      stock: newStock,
                    },
                  }
                );
                // console.log("x.quantity ", x.quantity);
                filteredProducts.push(x);
              }
            }
          })
        );

        console.log("filteredProducts ", filteredProducts);

        let output = await Order.create({
          customerId: userId,
          products: filteredProducts,
          totalPrice,
        });

        if (output?._id) {
          await Cart.deleteOne({ customerId: userId });
          return res
            .status(HTTP_STATUS.OK)
            .send(success("Successfully ordered the product"));
        }
        s;
      } else {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("No product exist in these cart"));
      }
    } catch (error) {
      console.log(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal error occured"));
    }
  };
}

module.exports = new CartController();
