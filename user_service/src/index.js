const protoLoader = require("@grpc/proto-loader");
const grpc = require("@grpc/grpc-js");
const { startGrpcServer, getGrpcServer } = require("./grpc");
const { createUser, createToken, getUser, isAuthenticated } = require("./user");
const PROTO_PATH = __dirname + "/../protos/user.proto";

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  defaults: true,
  oneofs: true,
});

const userProto = grpc.loadPackageDefinition(packageDefinition);

startGrpcServer();
const server = getGrpcServer();

server.addService(userProto.UserService.service, {
  createUser,
  createToken,
  isAuthenticated,
  getUser,
});
