const db = require("../db/connection");

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

exports.selectReviews = (category, sort_by = "created_at", order = `desc`) => {
  let queryString = `SELECT reviews.*, COUNT(body) ::INT AS comment_count FROM reviews 
  LEFT JOIN comments ON reviews.review_id=comments.review_id`;

  const columns = [
    "created_at",
    "owner",
    "title",
    "review_id",
    "category",
    "review_img_url",
    "votes",
    "designer",
    "comment_count",
  ];

  if (order !== "desc" && order !== "asc") {
    return Promise.reject({
      status: 400,
      msg: "Query order must be asc or desc",
    });
  }

  if (sort_by && !columns.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "Invalid column to sort by" });
  }

  const values = [];

  if (category) {
    values.push(category);
    queryString += ` WHERE category = $1`;
  }

  queryString += ` GROUP BY reviews.review_id ORDER BY ${sort_by} ${order}`;

  return db.query(queryString, values).then(({ rows: reviews }) => {
    return reviews;
  });
};

exports.selectCommentsByReview = (id) => {
  const queryString = `SELECT * FROM comments WHERE review_id = $1 ORDER BY created_at DESC`;

  return db.query(queryString, [id]).then(({ rows: comments }) => {
    return comments;
  });
};
<<<<<<< HEAD:models/reviews-model.js
=======

exports.insertComment = (id, text, user) => {
  const queryString = `INSERT INTO comments (review_id, body, author) VALUES ($1, $2, $3) RETURNING *`;

  return db.query(queryString, [id, text, user]).then(({ rows: [comment] }) => {
    return comment;
  });
};
>>>>>>> e9ad596 (refactor error handlers to be more readable):models/model.js
