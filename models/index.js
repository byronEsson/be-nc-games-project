const categories = require("./categories-model");
const reviews = require("./reviews-model");
const comments = require("./comments-model");
const users = require("./users-model");
const fs = require("fs/promises");

Object.assign(exports, categories);
Object.assign(exports, reviews);
Object.assign(exports, comments);
Object.assign(exports, users);

exports.readEndpoints = () => {
  return fs
    .readFile(__dirname + "/../endpoints.json", "utf-8")
    .then((endpoints) => {
      return JSON.parse(endpoints);
    });
};
