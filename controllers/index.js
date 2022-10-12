const categories = require("./categories-controller");
const reviews = require("./reviews-controller.js");
const comments = require("./comments-controller");
const users = require("./users-controller");
const { readEndpoints } = require("../models");

Object.assign(exports, categories);
Object.assign(exports, reviews);
Object.assign(exports, comments);
Object.assign(exports, users);

exports.getEndpoints = (req, res, next) => {
  readEndpoints().then((endpoints) => {
    res.status(200).send({ endpoints });
  });
};
