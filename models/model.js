const db = require("../db/connection");
const categories = require("../db/data/test-data/categories");

exports.selectCategories = () => {
  const queryString = `SELECT * FROM categories`;

  return db.query(queryString).then(({ rows: categories }) => {
    return categories;
  });
};

exports.selectReviewById = (reviewId) => {
  const queryString = `SELECT * FROM reviews WHERE review_id = $1`;
  const values = [reviewId];

  return db.query(queryString, values).then(({ rows: [review] }) => {
    if (!review) {
      return Promise.reject({ status: 404, msg: `No review with that ID (${reviewId})` });
    }
    return review;
  });
};
