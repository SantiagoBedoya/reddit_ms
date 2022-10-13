const protoLoader = require("@grpc/proto-loader");
const grpc = require("@grpc/grpc-js");
const { startGrpcServer, getGrpcServer } = require("./grpc");
const PROTO_PATH = __dirname + "/../protos/subreddit.proto";
const {createSubreddit, getSubreddit} = require('./subreddit')

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  defaults: true,
  oneofs: true,
});

const subredditProto = grpc.loadPackageDefinition(packageDefinition);

startGrpcServer();
const server = getGrpcServer();

server.addService(subredditProto.SubRedditService.service, {
  createSubreddit,
  getSubreddit,
});
