const { selectCategories, insertCategory } = require("../models");

exports.getCategories = (req, res, next) => {
  selectCategories()
    .then((categories) => {
      res.status(200).send({ categories });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postCategory = (req, res, next) => {
  insertCategory(req.body)
    .then((category) => {
      res.status(201).send({ category });
    })
    .catch((err) => next(err));
};
