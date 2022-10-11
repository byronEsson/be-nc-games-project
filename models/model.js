const db = require("../db/connection");
const categories = require("../db/data/test-data/categories");

exports.selectCategories = () => {
  const queryString = `SELECT * FROM categories`;

  return db.query(queryString).then(({ rows: categories }) => {
    return categories;
  });
};

exports.selectReviewById = (reviewId) => {
  const queryString = `SELECT reviews.*, COUNT(body) ::INT AS comment_count FROM reviews 
  LEFT JOIN comments ON reviews.review_id=comments.review_id WHERE reviews.review_id = $1
  GROUP BY reviews.review_id`;
  const values = [reviewId];

  return db.query(queryString, values).then(({ rows: [review] }) => {
    if (!review) {
      return Promise.reject({
        status: 404,
        msg: `No review with that ID (${reviewId})`,
      });
    }
    return review;
  });
};

exports.selectUsers = () => {
  const queryString = `SELECT * FROM users`;

  return db.query(queryString).then(({ rows: users }) => {
    return users;
  });
};

exports.updateReview = (id, increment) => {
  const queryString = `UPDATE reviews SET votes= votes+$2 WHERE review_id=$1 RETURNING *`;
  const values = [id, increment];
  return db.query(queryString, values).then(({ rows: [review] }) => {
    if (!review) {
      return Promise.reject({ status: 404, msg: "No review with that ID" });
    }
    return review;
  });
};

exports.selectReviews = (category) => {
  let queryString = `SELECT reviews.*, COUNT(body) ::INT AS comment_count FROM reviews 
  LEFT JOIN comments ON reviews.review_id=comments.review_id`;
  const values = [];

  if (category) {
    queryString += ` WHERE category = $1`;
    values.push(category);
  }

  queryString += ` GROUP BY reviews.review_id ORDER BY reviews.created_at DESC`;

  return db.query(queryString, values).then(({ rows: reviews }) => {
    return reviews;
  });
};
