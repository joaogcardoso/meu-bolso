const createApp = require("./app");
const env = require("./config/env");

const app = createApp();

const server = app.listen(env.port, () => {
  console.info(`Meu Bolso running at http://localhost:${env.port}`);
});

server.on("error", (error) => {
  console.error("HTTP server failed to start:", error.message);
  process.exit(1);
});

function shutdown(signal) {
  console.info(`${signal} received. Closing HTTP server.`);
  server.close((error) => {
    if (error) {
      console.error("Error while closing HTTP server:", error.message);
      process.exit(1);
    }

    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

module.exports = server;
