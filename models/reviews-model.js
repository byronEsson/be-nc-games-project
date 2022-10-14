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

exports.selectReviews = ({
  category,
  sort_by = "created_at",
  order = `desc`,
  limit,
  p = 1,
}) => {
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
  let queryString = `SELECT reviews.*, COUNT(body) ::INT AS comment_count FROM reviews LEFT JOIN comments ON reviews.review_id=comments.review_id`;

  if (category) {
    queryString += ` WHERE category = $1`;
    values.push(category);
  }

  queryString += ` GROUP BY reviews.review_id ORDER BY ${sort_by} ${order}`;

  if (limit) {
    values.push(limit);
    values.push(limit * (p - 1));
    queryString += ` LIMIT $${values.length - 1} OFFSET $${values.length}`;
  }

  return db.query(queryString, values).then(({ rows: reviews }) => {
    if (limit && reviews.length === 0) {
      return Promise.reject({ status: 404, msg: `No content found on p${p}` });
    }
    return reviews;
  });
};

exports.selectCommentsByReview = (id) => {
  const queryString = `SELECT * FROM comments WHERE review_id = $1 ORDER BY created_at DESC`;

  return db.query(queryString, [id]).then(({ rows: comments }) => {
    return comments;
  });
};

exports.insertReview = ({ owner, title, review_body, designer, category }) => {
  const values = [owner, title, review_body, designer, category];
  const queryString = `INSERT INTO reviews (owner, title, review_body, designer, category)
  VALUES ($1, $2, $3, $4, $5) RETURNING review_id`;

  return db.query(queryString, values).then(({ rows: [id] }) => {
    return id;
  });
};
