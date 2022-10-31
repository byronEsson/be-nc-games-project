const express = require("express");
const app = express();
const {
  pSQLErrorHandler,
  customErrorHandler,
  serverErrorHandler,
} = require("./error-handlers");
const apiRouter = require("./routers/api-router");
const cors = require("cors");

app.use(cors());
app.use(express.json());

app.all("/", (req, res) => {
  res
    .status(200)
    .send({
      greeting: "Hello there",
      instructions: "Navigate to /api to see a list of all enpoints",
    });
});
app.use("/api", apiRouter);

// ---ERRORS---

app.all("*", (req, res) => {
  res.status(404).send({ msg: "Route not found!" });
});

app.use(pSQLErrorHandler);

app.use(customErrorHandler);

app.use(serverErrorHandler);

module.exports = app;
