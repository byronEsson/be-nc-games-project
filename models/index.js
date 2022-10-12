const categories = require("./categories-model");
const reviews = require("./reviews-model");
const comments = require("./comments-model");
const users = require("./users-model");

Object.assign(exports, categories);
Object.assign(exports, reviews);
Object.assign(exports, comments);
Object.assign(exports, users);
