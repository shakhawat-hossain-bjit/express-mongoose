const Product = require("../models/Product");
const { insertInLog } = require("../server/logFile");
const { success, failure } = require("../utils/common");
const { validationResult } = require("express-validator");

class ProductController {
  fetchAll = async (req, res) => {
    try {
      let result = await Product.find({});
      let logFileResult = await insertInLog("GET_ALL_PRODUCT");
      // console.log(result);
      if (result?.length) {
        return res
          .status(200)
          .send(success("Successfully fetched all the data", result));
      } else {
        return res.status(400).send(failure("There is no data"));
      }
    } catch (e) {
      console.log(e);
      return res.status(400).send(failure("Internal error occured"));
    }
  };

  deleteOne = async (req, res) => {
    const { id } = req.params;
    if (id) {
      try {
        let result = await Product.deleteOne({ _id: id });
        let logFileResult = await insertInLog("DELETE_PRODUCT", id);
        // console.log(result);
        if (result?.deletedCount) {
          return res.status(200).send(success("successfully deleted the data"));
        } else {
          return res.status(400).send(success("Failed to delete"));
        }
      } catch (e) {
        console.log(e);
        return res.status(400).send(failure("Internal error occured"));
      }
    } else {
      return res.status(400).send(failure("Pass an id via your url"));
    }
  };

  findById = async (req, res) => {
    const { id } = req.params;
    if (id) {
      try {
        let result = await Product.find({ _id: id });
        let logFileResult = await insertInLog("GET_ONE_PRODUCT", id);
        // console.log(result);
        if (result.length)
          return res
            .status(200)
            .send(success("Successfully fetched the data", result[0]));
        else
          return res
            .status(404)
            .send(failure("There is no such data with this ID"));
      } catch (error) {
        console.log(error);
        return res.status(400).send(failure("Internal error occured"));
      }
    } else {
      return res.status(404).send(failure("Pass an id via your url"));
    }
  };

  postData = async (req, res) => {
    try {
      const validation = validationResult(req).array();
      if (validation.length) {
        return res
          .status(422)
          .send(failure("Invalid inputs provided", validation));
      }

      let product = new Product(req.body);
      let result = await product.save();

      // console.log("result ", result);
      if (result?._id) {
        let logFileResult = await insertInLog("POST_PRODUCT", result._id);
        return res
          .status(200)
          .send(success("successfully added the data", result));
      } else {
        return res.status(400).send(success("Failed to add the data"));
      }
    } catch (e) {
      console.log("Product inert error: ", e);
      return res.status(400).send(failure("Internal error occured"));
    }
  };

  updateData = async (req, res) => {
    const { id } = req.params;
    if (id) {
      try {
        const validation = validationResult(req).array();
        if (validation.length) {
          return res
            .status(422)
            .send(failure("Invalid inputs provided", validation));
        }

        let newProduct = req.body;
        if (newProduct.hasOwnProperty("id")) {
          return res.status(422).send(failure("Id proprty shouldn't pass"));
        }

        let result = await Product.updateOne({ _id: id }, { $set: newProduct });
        let logFileResult = await insertInLog("UPDATE_PRODUCT", id);
        // console.log(result);
        if (result?.modifiedCount) {
          return res.status(200).send(success("Successfully Updated"));
        } else if (result?.modifiedCount == 0) {
          if (result?.matchedCount)
            return res
              .status(200)
              .send(success("This data is already up to date"));
          else
            return res.status(200).send(failure("No such data with this id"));
        }
      } catch (error) {
        console.log("error ", error);
        return res.status(400).send(failure("Internal error occured"));
      }
    } else {
      return res
        .status(400)
        .send(failure("Pass an id via your url in query parameter"));
    }
  };
}

module.exports = new ProductController();
