const db = require("../db/connection");
const categories = require("../db/data/test-data/categories");

exports.selectCategories = () => {
  const queryString = `SELECT * FROM categories`;

  return db.query(queryString).then(({ rows: categories }) => {
    return categories;
  });
};
