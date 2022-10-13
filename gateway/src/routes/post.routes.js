const { Router } = require("express");
const { getClient } = require("../grpc/client");
const router = Router();
const { requiresAuth } = require("../middlewares/auth");
const PROTO_PATH = __dirname + "/../../protos/post.proto";

const client = getClient(PROTO_PATH, "PostService", "localhost:50051");

router.post("/comment/:id", requiresAuth, (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;
  client.commentPost({ id, user_id: req.user.id, comment }, (err, msg) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ success: false, msg: "comment post error" });
    }
    return res.status(200).json({ success: true, comment_id: msg.id });
  });
});
router.get("/like/:id", requiresAuth, (req, res) => {
  const { id } = req.params;
  client.likePost({ id, user_id: req.user.id }, (err, msg) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ success: false, msg: "like post error" });
    }
    return res.status(204).json({ success: true });
  });
});
router.patch("/:id", requiresAuth, (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  const updatePostRequest = {
    post_id: id,
    post: { title, description },
    user_id: req.user.id,
  };
  client.updatePost(updatePostRequest, (err, msg) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ sucess: false, msg: "update post error" });
    }
    return res.sendStatus(204).end();
  });
});

router.get("/:id", (req, res) => {
  const { id } = req.params;
  client.getPost({ id }, (err, msg) => {
    if (err) {
      console.log(err);
      if (err.message.includes("post not found")) {
        return res.status(404).json({ success: true, msg: "post not found" });
      }
      return res.status(500).json({ success: false, msg: "get post error" });
    }
    return res.status(200).json({ success: true, post: msg.post, comments: msg.comments });
  });
});

router.post("/", requiresAuth, (req, res) => {
  const { title, description, subreddit_id } = req.body;
  if (!title || !description || !subreddit_id) {
    return res
      .status(401)
      .json({ success: false, msg: "missing fields to create post" });
  }
  const createPostRequest = {
    post: {
      title,
      description,
      subreddit_id,
      author: req.user.id,
    },
  };
  client.createPost(createPostRequest, (err, msg) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ success: false, msg: "create post error" });
    }
    return res
      .status(201)
      .json({ success: true, msg: "post created", id: msg.id });
  });
});

module.exports = router;
