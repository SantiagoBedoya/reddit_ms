const { Router } = require("express");
const { getClient } = require("../grpc/client");
const { requiresAuth } = require("../middlewares/auth");
const PROTO_PATH = __dirname + "/../../protos/subreddit.proto";

const router = Router();
const client = getClient(PROTO_PATH, "SubRedditService", "localhost:50052");

router.post("/", requiresAuth, (req, res) => {
  const { name, description } = req.body;
  if (!name || !description) {
    return res
      .status(401)
      .json({ success: false, msg: "missing fields to create subreddit" });
  }
  const createSubredditRequest = {
    subreddit: {
      name,
      description,
      author: req.user.id,
    },
  };
  client.createSubreddit(createSubredditRequest, (err, msg) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ success: false, msg: "create subreddit error" });
    }
    return res
      .status(201)
      .json({ success: true, msg: "subreddit created", id: msg.id });
  });
});

module.exports = router;
