const db = require("../db/connection");

exports.selectUsers = () => {
  const queryString = `SELECT * FROM users`;

  return db.query(queryString).then(({ rows: users }) => {
    return users;
  });
};

exports.selectUserByUsername = (username) => {
  const queryString = `SELECT * FROM users WHERE username=$1`;

  return db.query(queryString, [username]).then(({ rows: [user] }) => {
    if (!user) {
      return Promise.reject({ status: 404, msg: "No user with that username" });
    }
    return user;
  });
};
