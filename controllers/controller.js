const {
  selectCategories,
  selectReviewById,
  selectUsers,
  updateReview,
  selectReviews,
  selectCommentsByReview,
  insertComment,
  removeComment,
} = require("../models/model");

exports.getController = (req, res, next) => {
  selectCategories()
    .then((categories) => {
      res.status(200).send({ categories });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getReviewById = (req, res, next) => {
  const { review_id } = req.params;

  selectReviewById(review_id)
    .then((review) => {
      res.status(200).send({ review });
    })
    .catch((err) => {
      err.review_id = review_id;
      next(err);
    });
};

exports.getUsers = (req, res, next) => {
  selectUsers()
    .then((users) => {
      res.status(200).send({ users });
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchReview = (req, res, next) => {
  const { review_id } = req.params;
  const {
    body: { inc_votes },
  } = req;

  updateReview(review_id, inc_votes)
    .then((review) => {
      res.status(200).send({ review });
    })
    .catch((err) => {
      err.review_id = review_id;
      err.inc_votes = inc_votes;
      next(err);
    });
};

exports.getReviews = (req, res, next) => {
  const { category, sort_by, order } = req.query;

  const promises = [selectReviews(category, sort_by, order)];

  if (category) promises.push(selectCategories());

  Promise.all(promises)
    .then(([reviews, categories]) => {
      let isACategory = true;
      if (category) {
        isACategory = false;
        for (let i = 0; i < categories.length; i++) {
          if (categories[i].slug === category) {
            isACategory = true;
            break;
          }
        }
      }
      if (isACategory) {
        res.status(200).send({ reviews });
      } else {
        return Promise.reject({ status: 404, msg: "No such category" });
      }
    })
    .catch((err) => next(err));
};

exports.getCommentsByReview = (req, res, next) => {
  const { review_id } = req.params;

  const promises = [
    selectCommentsByReview(review_id),
    selectReviewById(review_id),
  ];

  Promise.all(promises)
    .then(([comments]) => {
      res.status(200).send({ comments });
    })
    .catch((err) => {
      err.review_id = review_id;
      next(err);
    });
};

exports.postComment = (req, res, next) => {
  const { review_id } = req.params;
  const { username, comment } = req.body;

  Promise.all([
    insertComment(review_id, comment, username),
    selectReviewById(review_id),
  ])
    .then(([comment]) => {
      res.status(201).send({ comment });
    })
    .catch((err) => {
      err.review_id = review_id;
      next(err);
    });
};

exports.deleteComment = (req, res, next) => {
  const { comment_id } = req.params;

  removeComment(comment_id)
    .then(() => {
      res.status(204).send();
    })
    .catch((err) => {
      err.comment_id = comment_id;
      next(err);
    });
};
