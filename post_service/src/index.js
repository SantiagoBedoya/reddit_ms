const protoLoader = require("@grpc/proto-loader");
const grpc = require("@grpc/grpc-js");
const { startGrpcServer, getGrpcServer } = require("./grpc");
const PROTO_PATH = __dirname + "/../protos/post.proto";
const {getPost, createPost, commentPost, likePost, updatePost} = require('./posts')

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  defaults: true,
  oneofs: true,
});

const postProto = grpc.loadPackageDefinition(packageDefinition);

startGrpcServer();
const server = getGrpcServer();

server.addService(postProto.PostService.service, {
  getPost,
  createPost,
  commentPost,
  likePost,
  updatePost,
});
