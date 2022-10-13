const { Client } = require("pg");

const clientConfig = {
  user: "postgres",
  password: "root",
  database: "reddit_ms",
};

const client = new Client(clientConfig);
client.connect();

exports.createPost = function (call, cb) {
  const { title, description, subreddit_id, author } = call.request.post;
  client.query(
    "INSERT INTO posts(title, description, subreddit_id, author) VALUES ($1, $2, $3, $4) RETURNING id;",
    [title, description, subreddit_id, author],
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

exports.getPost = function (call, cb) {
  const { id } = call.request;
  client.query(
    "SELECT title, description, subreddit_id, author, likes FROM posts WHERE id = $1",
    [id],
    (err, res) => {
      if (err) {
        return cb(err, null);
      }
      if (res.rows.length == 0) {
        return cb(new Error("post not found"), null);
      } else {
        client.query('SELECT content FROM comments WHERE post_id = $1', [id], (err2, res2) => {
          if (err2) {
            return cb(err2, null)
          }
          const item = res.rows[0];
          const response = {
            post: {
              title: item.title,
              description: item.description,
              subreddit_id: item.subreddit_id,
              author: item.author,
              likes: item.likes,
              id,
            },
            comments: res2.rows.map(row => row.content),
          };
          return cb(null, response);
        })
        
      }
    }
  );
};

exports.updatePost = function (call, cb) {
  const { post_id, user_id, post } = call.request;
  const { title, description } = post;
  client.query(
    "SELECT author FROM posts WHERE id = $1",
    [post_id],
    (err, res) => {
      if (err) {
        return cb(err, null);
      }
      let query, values;
      if (res.rows.length > 0 && res.rows[0].author == user_id) {
        if (title != "" && description != "") {
          query = "UPDATE posts SET title = $1, description = $2 WHERE id = $3";
          values = [title, description, post_id];
        } else if (title != "") {
          query = "UPDATE posts SET title = $1 WHERE id = $2";
          values = [title, post_id];
        } else if (description != "") {
          query = "UPDATE posts SET description = $1 WHERE id = $2";
          values = [description, post_id];
        }
        client.query(query, values, (err, res) => {
          if (err) {
            return cb(err, null);
          }
          return cb(null, { id: post_id });
        });
        return;
      }
      return cb(new Error("user not authorized"), null);
    }
  );
};

exports.likePost = function (call, cb) {
  const { id, user_id } = call.request;
  client.query(
    "UPDATE posts SET likes = likes + 1 WHERE id = $1",
    [id],
    (err, res) => {
      if (err) {
        return cb(err, null);
      }
      return cb(null, { id });
    }
  );
};

exports.commentPost = function (call, cb) {
  const { id, user_id, comment } = call.request;
  client.query(
    "INSERT INTO comments(user_id, post_id, content) VALUES ($1, $2, $3) RETURNING id;",
    [user_id, id, comment],
    (err, res) => {
      if (err) {
        return cb(err, null);
      }
      return cb(null, { id: res.rows[0].id });
    }
  );
};
