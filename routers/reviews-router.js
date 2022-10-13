const {
  getReviews,
  getCommentsByReview,
  postCommentByReview,
  getReviewById,
  patchReview,
  postReview,
} = require("../controllers");

const reviewsRouter = require("express").Router();

reviewsRouter.route("/").get(getReviews).post(postReview);

reviewsRouter.route("/:review_id").get(getReviewById).patch(patchReview);

reviewsRouter
  .route("/:review_id/comments")
  .get(getCommentsByReview)
  .post(postCommentByReview);

module.exports = reviewsRouter;
