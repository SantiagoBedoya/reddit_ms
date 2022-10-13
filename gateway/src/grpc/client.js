const protoLoader = require("@grpc/proto-loader");
const grpc = require("@grpc/grpc-js");

exports.getClient = function (PROTO_PATH, serviceName, address) {
  const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    defaults: true,
    oneofs: true,
  });
  const Service = grpc.loadPackageDefinition(packageDefinition)[serviceName];
  const client = new Service(
    address,
    grpc.credentials.createInsecure()
  );
  return client;
};
