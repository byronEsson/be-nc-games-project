const categories = require("./categories-controller");
const reviews = require("./reviews-controller.js");
const comments = require("./comments-controller");
const users = require("./users-controller");

Object.assign(exports, categories);
Object.assign(exports, reviews);
Object.assign(exports, comments);
Object.assign(exports, users);


