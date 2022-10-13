const { getEndpoints } = require("../controllers");
const categoriesRouter = require("./categories-router");
const commentsRouter = require("./comments-router");
const reviewsRouter = require("./reviews-router");
const usersRouter = require("./users-router");

const apiRouter = require("express").Router();
apiRouter.use("/reviews", reviewsRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/categories", categoriesRouter);
apiRouter.use("/comments", commentsRouter);

apiRouter.get("/", getEndpoints);

module.exports = apiRouter;
