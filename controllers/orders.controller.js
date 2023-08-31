const Order = require("../models/Order");
const { insertInLog } = require("../server/logFile");
const { success, failure } = require("../utils/common");

class OrerController {
  findById = async (req, res) => {
    const { id } = req.params;
    // console.log(id);
    if (id) {
      try {
        let result = await Order.getSingleData(id);
        let logFileResult = await insertInLog("GET_ONE_ORDER", id);
        if (result.success) {
          if (result?.data)
            return res
              .status(200)
              .send(success("Successfully fetched the data", result?.data));
          else
            return res
              .status(404)
              .send(failure("There is no such data with this ID"));
        } else {
          return res.status(400).send(failure("failed to fetch the data"));
        }
      } catch (error) {
        return res.status(400).send(failure("Internal error occured"));
      }
    } else {
      return res.status(404).send(failure("Pass an id via your url"));
    }
  };
}

module.exports = new OrerController();
