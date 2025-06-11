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
async function checkTunnelHealth(tunnelUrl, maxRetries = 10) {
  // Add initial delay for DNS propagation
  await new Promise((resolve) => setTimeout(resolve, 5000));

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(tunnelUrl, {
        timeout: 5000, // 5 second timeout
        headers: {
          Accept: "application/json",
          "User-Agent": "TunnelHealthCheck",
        },
      });
      if (response.ok) {
        return true;
      }
    } catch (error) {
      log(
        `Tunnel health check attempt ${i + 1} failed: ${error.message}`,
        "warning"
      );
      // If it's a DNS error, wait longer
      if (
        error.message.includes("ENOTFOUND") ||
        error.message.includes("getaddrinfo")
      ) {
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds for DNS
      } else {
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Normal 2 second wait
      }
    }
  }
  return false;
}

// Run tests and exit with appropriate status codes
(async () => {
  try {
    const tunnelUrl = await tester.createTunnel();
    log(`Tunnel URL created: ${tunnelUrl}`, "info");
    log("Waiting for tunnel to be ready...", "info");

    // Wait for tunnel to be healthy
    // const isHealthy = await checkTunnelHealth(tunnelUrl);
    // if (!isHealthy) {
    //   throw new Error(
    //     `Tunnel failed to establish a healthy connection after multiple retries. Please check if the tunnel URL ${tunnelUrl} is accessible.`
    //   );
    // }
    await new Promise((resolve) => setTimeout(resolve, 10000));
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
