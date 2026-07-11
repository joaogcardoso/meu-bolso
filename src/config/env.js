const DEFAULT_PORT = 3030;

function parsePort(value) {
  if (value === undefined || value === "") {
    return DEFAULT_PORT;
  }

  const port = Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535.");
  }

  return port;
}

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parsePort(process.env.PORT),
  isProduction: process.env.NODE_ENV === "production",
};

module.exports = env;
