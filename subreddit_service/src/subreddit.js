const { Client } = require("pg");

const clientConfig = {
  user: "postgres",
  password: "root",
  database: "reddit_ms",
};

const client = new Client(clientConfig);
client.connect();

exports.createSubreddit = function (call, cb) {
  const { name, description } = call.request.subreddit;
  client.query(
    "INSERT INTO subreddits(name, description) VALUES ($1, $2) RETURNING id;",
    [name, description],
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
};

exports.getSubreddit = function (call, cb) {
  const { id } = call.request;
  client.query(
    "SELECT name, description FROM subreddits WHERE id = $1",
    [id],
    (err, res) => {
      if (err) {
        return cb(err, null);
      }
      const item = res.rows[0];
      const response = {
        subreddit: {
          id,
          name: item.name,
          description: item.description,
        },
      };
      return cb(null, response);
    }
  );
};

