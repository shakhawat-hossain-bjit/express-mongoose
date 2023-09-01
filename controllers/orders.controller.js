const HTTP_STATUS = require("../constants/statusCode");
const Order = require("../models/Order");
const { insertInLog } = require("../server/logFile");
const { success, failure } = require("../utils/common");

class OrerController {
  getAllOrder = async (req, res) => {
    try {
      let result = await Order.find()
        .populate("products.productId")
        .populate("customerId");
      let logFileResult = await insertInLog("GET_ALL_ORDER");
      // console.log(result);
      if (result?.length) {
        return res
          .status(HTTP_STATUS.OK)
          .send(success("Successfully fetched all the data", result));
      } else {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("There is no data"));
      }
    } catch (e) {
      console.log(e);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal error occured"));
    }
  };

  insertOne = async (req, res) => {
    try {
      const { products, customerId } = req.body;
      let order = new Order({ customerId, products });

      // saving the order
      let result = await order.save();
      let logFileResult = await insertInLog("POST_ORDER", result._id);
      if (result?._id) {
        let orderDetails = await Order.findOne({ _id: result?._id })
          .populate("products.productId")
          .populate("customerId");

        // calculating the totalPrice
        const { products } = orderDetails;
        let totalPrice = products?.reduce(
          (init, current) => init + current.productId.price * current.quantity,
          0
        );
        result.totalPrice = totalPrice;

        //updating result, set the totalPrice
        await Order.updateOne(
          { _id: result._id },
          { $set: { totalPrice: totalPrice } }
        );
        return res
          .status(HTTP_STATUS.CREATED)
          .send(success("successfully added the products", result));
      } else {
        return res.status(400).send(success("Failed to add the order"));
      }
    } catch (error) {
      console.log("Order insert error: ", error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal error occured"));
    }
  };
  getOrderById = async (req, res) => {
    try {
      const { id } = req.params;
      if (id) {
        let result = await Order.find({ _id: id })
          .populate("products.productId")
          .populate("customerId");
        // console.log(result);
        let logFileResult = await insertInLog("FIND_ORDER", id);
        if (result.length) {
          return res
            .status(HTTP_STATUS.OK)
            .send(success("Successfully fetched the data", result[0]));
        } else {
          return res
            .status(HTTP_STATUS.NOT_FOUND)
            .send(failure("There is no such data with this ID"));
        }
      } else {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .send(failure("Pass an id via your url"));
      }
    } catch (error) {
      console.log(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal error occured"));
    }
  };
}

module.exports = new OrerController();
