const { removeComment } = require("../models/index");

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
