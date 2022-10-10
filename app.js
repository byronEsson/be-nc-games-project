const express = require("express");
const {
  getController,
  getReviewById,
  getUsers,
} = require("./controllers/controller");
const app = express();

app.use(express.json());

app.get("/api/categories", getController);

app.get("/api/reviews/:review_id", getReviewById);

app.get("/api/users", getUsers);

// ---ERRORS---

app.all("*", (req, res) => {
  res.status(404).send({ msg: "Route not found!" });
});

app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "review_id must be a number" });
  } else next(err);
});

app.use((err, req, res, next) => {
  if (err) {
    res.status(err.status).send({ msg: err.msg });
  } else next(err);
});

app.use((err, req, res, next) => {
  res.status(500).send({ msg: "Server error" });
});

module.exports = app;
