import { log, handleError, formatTestResults } from "./helpers.js";
import RegressionTestRunner from "./test-runner.js";
import dotenv from "dotenv";
dotenv.config();

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

// Function to check if tunnel is healthy
async function checkTunnelHealth(tunnelUrl, maxRetries = 5) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(tunnelUrl);
      if (response.ok) {
        return true;
      }
    } catch (error) {
      log(
        `Tunnel health check attempt ${i + 1} failed: ${error.message}`,
        "warning"
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds between retries
  }
  return false;
}

// Run tests and exit with appropriate status codes
(async () => {
  try {
    const tunnelUrl = await tester.createTunnel();

    // Wait for tunnel to be healthy
    const isHealthy = await checkTunnelHealth(tunnelUrl);
    if (!isHealthy) {
      throw new Error(
        "Tunnel failed to establish a healthy connection after multiple retries"
      );
    }

    log("Tunnel is healthy and ready to use", "success");

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
  } catch (error) {
    handleError(error);
  }
})();

// Handle uncaught exceptions
process.on("uncaughtException", handleError);
process.on("unhandledRejection", handleError);
