const express = require("express");
const {
  getController,
  getReviewById,
  getUsers,
  patchReview,
  getReviews,
  getCommentsByReview,
  deleteComment,
  postComment,
} = require("./controllers/controller");
const app = express();

app.use(express.json());

app.get("/api/categories", getController);

app.get("/api/reviews/:review_id", getReviewById);

app.get("/api/users", getUsers);

app.patch("/api/reviews/:review_id", patchReview);

app.get("/api/reviews", getReviews);

app.get("/api/reviews/:review_id/comments", getCommentsByReview);

app.delete("/api/comments/:comment_id", deleteComment);
app.post("/api/reviews/:review_id/comments", postComment);

// ---ERRORS---

app.all("*", (req, res) => {
  res.status(404).send({ msg: "Route not found!" });
});

app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    let addToError = "";
    // if (req.method === "GET") addToError = " for review_id";
    //req.method === "PATCH" &&
    if (isNaN(err.review_id) && err.review_id !== undefined) {
      addToError = " for review_id";
      //
    } else if (req.method === "PATCH") {
      addToError = " for inc_votes";
    } else if (isNaN(err.comment_id)) {
      addToError = " for comment_id";
    }
    res.status(400).send({ msg: `Incorrect datatype${addToError}` });
    //
  } else if (err.code === "23502") {
    res.status(400).send({
      msg: "Invalid post body - missing necessary keys",
    });
  } else if (err.code === "23503") {
    const forErr = err.detail.split(" ");
    res.status(404).send({ msg: `No content found for ${forErr[1]}` });
  } else next(err);
});

app.use((err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else next(err);
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send({ msg: "Server error" });
});

module.exports = app;
