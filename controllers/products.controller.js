const Product = require("../models/Product");
const { insertInLog } = require("../server/logFile");
const { success, failure } = require("../utils/common");
const { validationResult } = require("express-validator");
const sendVerificationEmail = require("../utils/nodeMailer");
const HTTP_STATUS = require("../constants/statusCode");

class ProductController {
  fetchAll = async (req, res) => {
    try {
      //pagination
      const { page = 1, limit = 10 } = req.query;
      // console.log(page, limit);
      if (page < 1 || limit < 0) {
        return res
          .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
          .send(
            failure(
              "Page and Limit values must be at least 1 or 0 respectively"
            )
          );
      }

      // sort portion
      let { sortParam, sortAsc, sortDesc } = req.query;
      console.log(sortParam, sortAsc, sortDesc);
      if (sortParam && !Array.isArray(sortParam)) {
        let tmp = [sortParam];
        sortParam = tmp;
      }
      if (sortAsc && !Array.isArray(sortAsc)) {
        let tmp = [sortAsc];
        sortAsc = tmp;
      }
      if (sortDesc && !Array.isArray(sortDesc)) {
        let tmp = [sortDesc];
        sortDesc = tmp;
      }
      // console.log("arrafy ", sortParam, sortAsc, sortDesc);

      const isExistBoth =
        sortAsc?.length === sortDesc?.length &&
        sortAsc?.every((val) => sortDesc?.includes(val) && val != undefined);

      if (isExistBoth) {
        return res
          .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
          .send(
            failure(
              "Same property can't be used for both ascending and descending sorting"
            )
          );
      }
      let sortObj = {};
      if (sortParam?.length) {
        sortParam?.forEach((x) => {
          if (sortAsc?.includes(x)) {
            sortObj[x] = 1;
          } else if (sortDesc?.includes(x)) {
            sortObj[x] = -1;
          } else {
            sortObj[x] = 1;
          }
        });
      } else {
        if (sortAsc?.length || sortDesc?.length)
          return res
            .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
            .send(
              failure(
                "Sort parameter is not provided, but sort order is provided"
              )
            );
      }
      // console.log(sortObj);

      // filter
      // rating range
      let query = {};
      let { ratingType } = req.query;
      let ratingLow, ratingHigh;
      if (ratingType == "high") {
        query.rating = { $gt: 4.8 };
      } else if (ratingType == "mid") {
        query = {
          $and: [{ rating: { $gte: 3.5 } }, { rating: { $lte: 4 } }],
        };
      } else if (ratingType == "low") {
        query.rating = { $lte: 3 };
      } else if (ratingType) {
        return res
          .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
          .send(failure("Rating type " + ratingType + " not valid"));
      }
      // price range
      let { priceType } = req.query;
      if (priceType == "high") {
        query.price = { $gt: 1000 };
      } else if (priceType == "mid") {
        query = {
          $and: [{ price: { $gte: 500 } }, { rating: { $lte: 1000 } }],
        };
      } else if (priceType == "low") {
        query.price = { $gt: 100 };
      } else if (priceType) {
        return res
          .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
          .send(failure("Rating type " + priceType + " not valid"));
      }

      // find by specific property
      let { rating, price, stock } = req.query;
      if (price || price == 0) {
        // console.log(price);
        query.price = parseFloat(price);
      }
      if (rating || rating == 0) {
        // console.log(rating);
        query.rating = parseFloat(rating);
      }
      if (stock || stock == 0) {
        // console.log(stock);
        query.stock = parseFloat(stock);
      }

      // find by title and description
      let { search, category } = req.query;
      // if (search) {
      //   let re = new RegExp(`${search}`, "i");
      //   // query.title = { $regex: re };
      //   // query.description = { $regex: re };
      //   query.title = { $regex: re };
      // }
      if (search) {
        query["$or"] = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          // { category: { $regex: search, $options: "i" } },
        ];
      }
      if (category) {
        query["$or"] = [{ category: { $regex: category, $options: "i" } }];
      }

      console.log("query  ==> ", query);

      let result = await Product.find(query)
        .sort(sortObj)
        .skip((page - 1) * limit)
        .limit(limit);
      // console.log("result ", result);

      let totalDocuemnts = await Product.countDocuments(query);
      console.log(totalDocuemnts);

      let logFileResult = await insertInLog("GET_ALL_PRODUCT");
      const obj = {};
      obj.total = totalDocuemnts;
      obj.countInCurrentPage = result.length;
      obj.page = page;
      obj.limit = limit;
      obj.products = result;
      if (totalDocuemnts) {
        return res
          .status(200)
          .send(success("Successfully fetched the data", obj));
      } else {
        return res.status(400).send(failure("There is no data"));
      }
    } catch (e) {
      console.log(e);
      return res.status(400).send(failure("Internal error occured"));
    }
  };

  deleteOne = async (req, res) => {
    try {
      const validation = validationResult(req).array();
      if (validation.length) {
        return res
          .status(422)
          .send(failure("Invalid inputs provided", validation));
      }
      const { id } = req.params;
      let result = await Product.deleteOne({ _id: id });
      let logFileResult = await insertInLog("DELETE_PRODUCT", id);
      // console.log(result);
      if (result?.deletedCount) {
        return res.status(200).send(success("successfully deleted the data"));
      } else {
        return res.status(404).send(failure("Not Found"));
      }
    } catch (e) {
      console.log(e);
      return res.status(400).send(failure("Internal error occured"));
    }
  };

  findById = async (req, res) => {
    try {
      const { id } = req.params;
      const validation = validationResult(req).array();
      if (validation.length) {
        return res
          .status(422)
          .send(failure("Invalid inputs provided", validation));
      }

      let result = await Product.find({ _id: id });
      let logFileResult = await insertInLog("GET_ONE_PRODUCT", id);
      // console.log(result);
      if (result.length) {
        // const verificationCode = generateVerificationCode();
        // await sendVerificationEmail("shihabctag@gmail.com", 123456);
        return res
          .status(200)
          .send(success("Successfully fetched the data", result[0]));
      } else {
        return res
          .status(404)
          .send(failure("There is no such data with this ID"));
      }
    } catch (error) {
      console.log(error);
      return res.status(400).send(failure("Internal error occured"));
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
      console.log("body ", req.body);
      const {
        title,
        description,
        price,
        stock,
        discountPercentage,
        rating,
        brand,
        category,
        images,
      } = req.body;
      let product = new Product({
        title,
        description,
        price,
        stock,
        discountPercentage,
        rating,
        brand,
        category,
        images,
      });
      console.log(product);
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
    try {
      const { id } = req.params;
      const validation = validationResult(req).array();
      if (validation.length) {
        return res
          .status(422)
          .send(failure("Invalid inputs provided", validation));
      }

      const {
        title,
        description,
        price,
        stock,
        discountPercentage,
        rating,
        brand,
        category,
        images,
      } = req.body;

      let result = await Product.updateOne(
        { _id: id },
        {
          $set: {
            title,
            description,
            price,
            stock,
            discountPercentage,
            rating,
            brand,
            category,
            images,
          },
        }
      );
      let logFileResult = await insertInLog("UPDATE_PRODUCT", id);
      // console.log(result);
      if (result?.modifiedCount) {
        return res.status(200).send(success("Successfully Updated"));
      } else if (result?.modifiedCount == 0) {
        if (result?.matchedCount)
          return res
            .status(200)
            .send(success("This data is already up to date"));
        else return res.status(200).send(failure("No such data with this id"));
      }
    } catch (error) {
      console.log("error ", error);
      return res.status(400).send(failure("Internal error occured"));
    }
  };
}

module.exports = new ProductController();
