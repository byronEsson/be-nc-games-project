const {
  getReviews,
  getCommentsByReview,
  postCommentByReview,
  getReviewById,
  patchReview,
} = require("../controllers");

const reviewsRouter = require("express").Router();

reviewsRouter.get("/", getReviews);

reviewsRouter.route("/:review_id").get(getReviewById).patch(patchReview);

reviewsRouter
  .route("/:review_id/comments")
  .get(getCommentsByReview)
  .post(postCommentByReview);

module.exports = reviewsRouter;
