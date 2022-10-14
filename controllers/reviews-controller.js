const {
  selectReviewById,
  updateReview,
  selectReviews,
  selectCommentsByReview,
  selectCategories,
  insertComment,
  insertReview,
} = require("../models/index");

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
  const { category, limit, p } = req.query;

  const promises = [selectReviews(req.query)];

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
    .catch((err) => {
      err.limit = limit;
      err.p = p;
      next(err);
    });
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

exports.postCommentByReview = (req, res, next) => {
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

exports.postReview = (req, res, next) => {
  const { body } = req;

  insertReview(body)
    .then(({ review_id }) => {
      return selectReviewById(review_id);
    })
    .then((review) => {
      res.status(201).send({ review });
    })
    .catch((err) => next(err));
};
