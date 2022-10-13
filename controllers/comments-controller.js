const { removeComment, updateCommentById } = require("../models/index");

exports.deleteCommentById = (req, res, next) => {
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

exports.patchCommentById = (req, res, next) => {
  const { comment_id } = req.params;
  const { inc_votes } = req.body;
  updateCommentById(comment_id, inc_votes)
    .then((comment) => {
      res.status(200).send({ comment });
    })
    .catch((err) => {
      err.comment_id = comment_id;
      next(err);
    });
};
