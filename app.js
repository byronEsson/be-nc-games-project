const express = require("express");
const { getController } = require("./controllers/controller");
const app = express();

app.use(express.json());

app.get("/api/categories", getController);

app.use("*", (req, res) => {
  res.status(404).send({ msg: "Route not found!" });
});

module.exports = app;
