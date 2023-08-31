const fs = require("fs");
const path = require("path");
const fsPromise = require("fs").promises;
const bcrypt = require("bcrypt");

class User {
  async createUser(newUser) {
    return fsPromise
      .readFile(path.join(__dirname, "..", "data", "user.json"), {
        encoding: "utf-8",
      })
      .then((data) => {
        const jsonData = JSON.parse(data);
        return jsonData;
      })
      .then((jsonData) => {
        // console.log("jsonData & newUser ", jsonData, newUser);
        // console.log("id ", jsonData[jsonData.length - 1].id + 1);
        let id = jsonData[jsonData.length - 1].id + 1;
        newUser = {
          ...newUser,
          id: id,
          confirmPassword: undefined,
        };
        const saltRounds = 10;
        const salt = bcrypt.genSaltSync(saltRounds);
        const hash = bcrypt.hashSync(newUser.password, salt);
        newUser.password = hash;
        jsonData.push(newUser);
        return fsPromise
          .writeFile(
            path.join(__dirname, "..", "data", "user.json"),
            JSON.stringify(jsonData)
          )
          .then((res) => {
            return { success: true, id };
          })
          .catch((e) => {
            // console.log("error in writing in the file");
            return { success: false };
          });
      })
      .catch((error) => {
        // console.log("error in reading the file", error);
        return { success: false };
      });
  }

  async logInUser(user) {
    return fsPromise
      .readFile(path.join(__dirname, "..", "data", "user.json"), {
        encoding: "utf-8",
      })
      .then((data) => {
        const jsonData = JSON.parse(data);
        return jsonData;
      })
      .then((jsonData) => {
        user.email = user?.email?.toLowerCase();
        let found = jsonData.find((x) => x?.email == user?.email);
        if (found) {
          let isMatched = bcrypt.compareSync(user.password, found?.password);
          // console.log("isMatched ", isMatched);
          if (isMatched) return { success: true };
          else return { success: false };
        } else {
          return { success: false };
        }
      })
      .catch((error) => {
        // console.log("error in reading the file", error);
        return { success: false };
      });
  }

  async getOrdersByUserId(id) {
    return fsPromise
      .readFile(path.join(__dirname, "..", "data", "user.json"), {
        encoding: "utf-8",
      })
      .then((data) => {
        //all the users
        data = JSON.parse(data);
        let user = data.find((x) => x.id == id);
        return user;
      })
      .then((user) => {
        // console.log("user ", user);
        if (user) {
          return fsPromise
            .readFile(path.join(__dirname, "..", "data", "order.json"), {
              encoding: "utf-8",
            })
            .then((data) => {
              // all the orders
              let orders = JSON.parse(data);

              let orderListForCurrentUser = {};
              //   console.log("user ", user.orders);
              orders.forEach((order) => {
                if (user.orders.includes(order.id)) {
                  orderListForCurrentUser[order.id] = order.products;
                }
              });
              return orderListForCurrentUser;
            })
            .then((orderListForCurrentUser) => {
              // console.log(orderListForCurrentUser);
              if (Object.keys(orderListForCurrentUser).length) {
                return fsPromise
                  .readFile(
                    path.join(__dirname, "..", "data", "product.json"),
                    {
                      encoding: "utf-8",
                    }
                  )
                  .then((data) => {
                    // all th products
                    let products = JSON.parse(data);
                    // console.log("user ", user);
                    // console.log("orderListForCurrentUser ", orderListForCurrentUser);
                    // console.log("product ", products);

                    if (products.length) {
                      const orderList = [];
                      user?.orders?.forEach((current) => {
                        // for each order id of a user
                        const obj = {};
                        obj.order_id = current;
                        let currentProducts =
                          orderListForCurrentUser[obj.order_id];
                        //   console.log(currentOrderObj);
                        let orderedProducts = products.filter((x) => {
                          if (currentProducts.includes(x.id)) {
                            return x;
                          }
                        });
                        obj.orderedProducts = orderedProducts;
                        //   console.log("object ", obj);
                        orderList.push(obj);
                      });
                      // console.log(orderList);
                      user.ordersListDetails = orderList;
                      return { success: true, data: user };
                    } else {
                      return {
                        success: false,
                        message: "Products are unable to fetch",
                      };
                    }
                  })
                  .catch((error) => {
                    return { success: false };
                  });
              } else {
                return {
                  success: false,
                  message: "You have no order yet",
                };
              }
            })
            .catch((error) => {
              return { success: true };
            });
        } else {
          return { success: false, message: "User not found" };
        }
      })
      .catch((error) => {
        return { success: false };
      });
  }
}

module.exports = new User();
