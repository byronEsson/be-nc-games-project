const db = require("../db/connection");

exports.selectCategories = () => {
  const queryString = `SELECT * FROM categories`;

  return db.query(queryString).then(({ rows: categories }) => {
    return categories;
  });
};

exports.insertCategory = ({ slug, description }) => {
  const queryString = `INSERT INTO categories (slug, description) VALUES ($1, $2) RETURNING *`;

  return db
    .query(queryString, [slug, description])
    .then(({ rows: [category] }) => {
      return category;
    });
};
