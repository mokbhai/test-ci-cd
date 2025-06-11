import { log, handleError, formatTestResults } from "./helpers.js";
import RegressionTestRunner from "./test-runner.js";

// Get the base URL from environment variable or use default
const nodeEnv = process.env.NODE_ENV || "production";
const baseUrl =
  nodeEnv === "production"
    ? "https://api.drcode.ai"
    : "https://devapi.drcode.ai/testgpt";
const projectId = process.env.PROJECT_ID;
const emails = process.env.EMAILS?.split(",") || [];
const port = process.env.PORT || 3000;
const localHost = process.env.LOCAL_HOST || "localhost";

if (!projectId) {
  handleError({ message: "PROJECT_ID is not set" });
}
if (!emails || emails.length === 0) {
  handleError({ message: "EMAILS is not set" });
}

if (!port) {
  handleError({ message: "PORT is not set" });
}

if (!localHost) {
  handleError({ message: "LOCAL_HOST is not set" });
}

const tester = new RegressionTestRunner(
  baseUrl,
  projectId,
  emails,
  port,
  localHost
);

// Run tests and exit with appropriate status codes
(async () => {
  const tunnelUrl = await tester.createTunnel();
  log(`Tunnel created successfully: ${tunnelUrl}`, "success");
  await new Promise((resolve) => setTimeout(resolve, 10000));

  await tester
    .getAllTests()
    .then(() => {
      log("All tests retrieved successfully", "success");
      return tester.runAllTests();
    })
    .then(() => {
      return tester.getTestResults();
    })
    .then((results) => {
      log("Test execution completed", "success");
      log(formatTestResults(results));
      process.exit(0); // Explicitly exit with success
    })
    .catch(handleError);
})();
// Handle uncaught exceptions
process.on("uncaughtException", handleError);
process.on("unhandledRejection", handleError);
