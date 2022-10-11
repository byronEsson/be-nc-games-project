const {
  selectCategories,
  selectReviewById,
  selectUsers,
  updateReview,
  selectReviews,
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
  const { category } = req.query;

  const promises = [selectReviews(category)];

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
