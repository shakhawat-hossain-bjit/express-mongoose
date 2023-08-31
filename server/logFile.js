const fs = require("fs");
const { getCurrentUser } = require("../authentication/user");
const path = require("path");

async function readLogFile(filePath) {
  try {
    const data = await fs.promises.readFile(filePath, "utf-8");
    // console.log("my data ", data);
    jsonData = JSON.parse(data);
    return jsonData;
  } catch (error) {
    throw new Error(`Error reading file: ${error.message}`);
  }
}

async function writeFile(filePath, data) {
  try {
    await fs.promises.writeFile(filePath, JSON.stringify(data), "utf-8");
  } catch (error) {
    throw new Error(`Error writing file: ${error.message}`);
  }
}

async function insertInLog(operation, parameter = null) {
  try {
    let date = new Date();
    const user = getCurrentUser();
    let time = date;
    let message;
    message = {
      operation,
      requester: user,
      time,
    };

    if (
      operation == "GET_ONE_PRODUCT" ||
      operation == "POST_PRODUCT" ||
      operation == "DELETE_PRODUCT" ||
      operation == "UPDATE_PRODUCT" ||
      operation == "GET_ORDERS_FOR_USER" ||
      operation == "GET_ONE_ORDER"
    ) {
      message.id = parameter;
    }
    if (operation == "FILTER_PRICE") {
      message.price = parameter;
    }
    if (operation == "LOG_IN" || operation == "SIGN_UP") {
      message.email = parameter;
    }

    const filePath = path.join(__dirname, "log.json");
    // console.log(filePath);
    const fileData = await readLogFile(filePath);
    // console.log("File data: ", fileData);
    // console.log(message);
    fileData.push(message);
    const result = await writeFile(filePath, fileData);
    return { success: true };
  } catch (error) {
    console.error(error.message);
    return { success: false };
  }
}

module.exports = { insertInLog };
