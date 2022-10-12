const express = require("express");
const app = express();
const {
  getReviewById,
  patchReview,
  getReviews,
  getCommentsByReview,
  getCategories,
  getUsers,
  deleteComment,
  postCommentByReview,
} = require("./controllers/index");
const {
  pSQLErrorHandler,
  customErrorHandler,
  serverErrorHandler,
} = require("./error-handlers");

app.use(express.json());

app.get("/api/categories", getCategories);

app.get("/api/reviews/:review_id", getReviewById);

app.get("/api/users", getUsers);

app.patch("/api/reviews/:review_id", patchReview);

app.get("/api/reviews", getReviews);

app.get("/api/reviews/:review_id/comments", getCommentsByReview);

app.delete("/api/comments/:comment_id", deleteComment);
app.post("/api/reviews/:review_id/comments", postCommentByReview);

// ---ERRORS---

app.all("*", (req, res) => {
  res.status(404).send({ msg: "Route not found!" });
});

app.use(pSQLErrorHandler);

app.use(customErrorHandler);

app.use(serverErrorHandler);

module.exports = app;
