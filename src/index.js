import "dotenv/config";
import { log, handleError, formatTestResults } from "./helpers.js";
import RegressionTestRunner from "./test-runner.js";

// Get the base URL from environment variable or use default
const nodeEnv = process.env.NODE_ENV || "production";
let baseUrl =
  nodeEnv === "production"
    ? "https://api.drcode.ai"
    : "https://devapi.drcode.ai/testgpt";
const projectId = process.env.PROJECT_ID;
const emails = process.env.EMAILS?.split(",") || [];
const port = process.env.PORT || 3000;
const localHost = process.env.LOCAL_HOST || "localhost";
const prefix = process.env.PREFIX || "";

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
  localHost,
  prefix
);

// Run tests and exit with appropriate status codes
try {
  await tester.getAllTests();
  log("All tests retrieved successfully", "success");

  await tester.runAllTests();
  log("All tests initiated successfully", "success");

  const results = await tester.getTestResults();
  log("Test execution completed", "success");
  const { output, summary } = formatTestResults(results);
  log(output);
  if (summary.failed > 0) {
    log("Test failed", "error");
    process.exit(1); // Explicitly exit with failure
  } else {
    process.exit(0); // Explicitly exit with success
  }
} catch (error) {
  handleError(error);
}

// Handle uncaught exceptions
process.on("uncaughtException", handleError);
process.on("unhandledRejection", handleError);
