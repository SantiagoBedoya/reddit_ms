const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Client } = require("pg");

const clientConfig = {
  user: "postgres",
  password: "root",
  database: "reddit_ms",
};

const client = new Client(clientConfig);
client.connect();

exports.createUser = function createUse(call, cb) {
  const { username, email, password } = call.request.user;
  // hash the password
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return cb(err, null);
    }
    bcrypt.hash(password, salt, (err, hash) => {
      if (err) {
        return cb(err, null);
      }
      client.query(
        "INSERT INTO users(username, email, password) VALUES ($1, $2, $3) RETURNING id;",
        [username, email, hash],
        (err, res) => {
          if (err) {
            return cb(err, null);
          }
          const response = {
            id: res.rows[0].id,
          };
          return cb(null, response);
        }
      );
    });
  });
};

exports.getUser = function (call, cb) {
  const { id } = call.request;
  client.query(
    "SELECT username, email FROM users WHERE id = $1",
    [id],
    (err, res) => {
      if (err) {
        return cb(err, null);
      }
      const response = {
        user: {
          username: res.rows[0].username,
          email: res.rows[0].email,
          id,
        }
      };
      return cb(null, response);
    }
  );
};

exports.createToken = function (call, cb) {
  const user = call.request.user;
  client.query(
    "SELECT id, username, email, password FROM users WHERE email = $1",
    [user.email],
    (err, res) => {
      if (err) {
        return cb(err, null);
      }
      bcrypt.compare(user.password, res.rows[0].password, (err, ok) => {
        if (err) return cb(err, null);
        if (!ok) return cb(new Error("invalid credentials (password)"), null);
        user.id = res.rows[0].id;
        user.username = res.rows[0].username;
        jwt.sign(user, "SECRET", (err, token) => {
          if (err) return cb(err, null);
          const response = {
            token,
          };
          return cb(null, response);
        });
      });
    }
  );
};

exports.isAuthenticated = function (call, cb) {
  const token = call.request.token;
  jwt.verify(token, "SECRET", (err, user) => {
    if (err) return cb(err, null);
    const response = {
      user,
      ok: true,
    }
    return cb(null, response);
  })
}
