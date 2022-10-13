const { Router } = require("express");
const { getClient } = require("../grpc/client");
const PROTO_PATH = __dirname + "/../../protos/user.proto";

const router = Router();

const client = getClient(PROTO_PATH, "UserService", "localhost:50050");

router.get("/:id", (req, res) => {
  const { id } = req.params;
  client.getUser({ id }, (err, msg) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ success: false, msg: "get user error" });
    }
    if (!msg.user.email) {
      return res.status(404).json({ success: true, msg: "user not found" });
    }
    return res.status(200).json({ success: true, user: msg.user });
  });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const createTokenRequest = {
    user: {
      email,
      password,
    },
  };
  client.createToken(createTokenRequest, (err, msg) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ success: true, msg: "create token error" });
    }
    return res.status(200).json({ success: true, token: msg.token });
  });
});

router.post("/register", (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res
      .status(401)
      .json({ success: false, msg: "missing fields to register user" });
  }
  const createUserRequest = {
    user: {
      email,
      username,
      password,
    },
  };
  client.createUser(createUserRequest, (err, msg) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ success: false, msg: "user auth error" });
    }
    return res
      .status(201)
      .json({ success: true, msg: "user created", id: msg.id });
  });
});

module.exports = router;
