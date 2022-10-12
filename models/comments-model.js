const db = require("../db/connection");
exports.insertComment = (id, text, user) => {
  const queryString = `INSERT INTO comments (review_id, body, author) VALUES ($1, $2, $3) RETURNING *`;

  return db.query(queryString, [id, text, user]).then(({ rows: [comment] }) => {
    return comment;
  });
};

exports.removeComment = (id) => {
  const queryString = `DELETE FROM comments WHERE comment_id=$1 RETURNING *`;

  return db.query(queryString, [id]).then(({ rows: [comment] }) => {
    if (!comment) {
      return Promise.reject({
        status: 404,
        msg: `No content found for (comment_id)=(${id})`,
      });
    } else return;
  });
};
