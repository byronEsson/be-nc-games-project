exports.pSQLErrorHandler = (err, req, res, next) => {
  if (err.code === "22P02") {
    let addToError = "";
    if (isNaN(err.review_id) && err.review_id) {
      addToError = " for review_id";
      //
    } else if (isNaN(err.comment_id) && err.comment_id) {
      addToError = " for comment_id";
    } else if (req.method === "PATCH") {
      addToError = " for inc_votes";
    }
    res.status(400).send({ msg: `Incorrect datatype${addToError}` });
    //
  } else if (err.code === "23502") {
    res.status(400).send({
      msg: "Invalid request body - missing necessary keys",
    });
  } else if (err.code === "23503") {
    const forErr = err.detail.split(" ");
    res.status(404).send({ msg: `No content found for ${forErr[1]}` });
  } else next(err);
};

exports.customErrorHandler = (err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else next(err);
};

exports.serverErrorHandler = (err, req, res, next) => {
  console.log(err);
  res.status(500).send({ msg: "Server error", err });
};
