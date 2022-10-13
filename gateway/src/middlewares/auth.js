
const { getClient } = require("../grpc/client");
const PROTO_PATH = __dirname + "/../../protos/user.proto";

const client = getClient(PROTO_PATH, 'UserService', "localhost:50050");

exports.requiresAuth = function (req, res, next) {
  const header = req.headers["authorization"];
  if (!header){
    return res.status(401).end()
  }
  const token = req.headers["authorization"].split(" ")[1];
  client.isAuthenticated({ token }, (err, msg) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ success: false, msg: "user auth error" });
    }
    const user = {
      id: msg.user.id,
      username: msg.user.username,
      email: msg.user.email,
    }
    req.user = user;
    next();
  });
};
