const {
  getReviews,
  getCommentsByReview,
  postCommentByReview,
  getReviewById,
  patchReview,
  postReview,
  deleteReviewById,
} = require("../controllers");

const reviewsRouter = require("express").Router();

reviewsRouter.route("/").get(getReviews).post(postReview);

reviewsRouter
  .route("/:review_id")
  .get(getReviewById)
  .patch(patchReview)
  .delete(deleteReviewById);

reviewsRouter
  .route("/:review_id/comments")
  .get(getCommentsByReview)
  .post(postCommentByReview);

module.exports = reviewsRouter;
