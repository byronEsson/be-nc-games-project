const express = require("express");
const { getController } = require("./controllers/controller");
const app = express();

app.use(express.json());

app.get("/api/categories", getController);


module.exports = app;
