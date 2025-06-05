const axios = require("axios");

// Helper function for consistent logging
const log = (message, type = "info") => {
  const timestamp = new Date().toISOString();
  const prefix = type === "error" ? "❌" : type === "success" ? "✅" : "ℹ️";
  console.log(`[${timestamp}] ${prefix} ${message}`);
};

class RegressionTestRunner {
  constructor(baseUrl, projectId, emails) {
    this.baseUrl = baseUrl;
    this.projectId = projectId;
    this.emails = emails;
    this.axios = axios.create({
      baseURL: baseUrl,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async runAllTests() {
    try {
      log(`Starting regression tests for project: ${this.projectId}`);
      await axios.post(
        `${this.baseUrl}/api/regressionTest/runAll`,
        {
          projectId: this.projectId,
          emails: this.emails,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      log("All tests initiated successfully", "success");
      return true;
    } catch (error) {
      log(`Failed to run tests: ${error.message}`, "error");
      throw error;
    }
  }

  async getTestResults() {
    try {
      log("Fetching test results...");
      const response = await axios.get(
        `${this.baseUrl}/api/regressionTest/project/${this.projectId}`
      );
      log("Test results retrieved successfully", "success");
      return response.data;
    } catch (error) {
      log(`Failed to get test results: ${error.message}`, "error");
      throw error;
    }
  }
}

// Get the base URL from environment variable or use default
const nodeEnv = process.env.NODE_ENV || "production";
const baseUrl =
  nodeEnv === "production"
    ? "https://api.drcode.ai"
    : "https://devapi.drcode.ai/testgpt";
const projectId = process.env.PROJECT_ID;
const emails = process.env.EMAILS.split(",");

if (!projectId) {
  log("PROJECT_ID is not set", "error");
  process.exit(1);
}
if (!emails || emails.length === 0) {
  log("EMAILS is not set", "error");
  process.exit(1);
}

log(`Environment: ${nodeEnv}`);
log(`Base URL: ${baseUrl}`);
log(`Project ID: ${projectId}`);
log(`Number of emails: ${emails.length}`);

const tester = new RegressionTestRunner(baseUrl, projectId, emails);

// Run tests and exit with appropriate status codes
tester
  .runAllTests()
  .then(() => {
    return tester.getTestResults();
  })
  .then((results) => {
    log("Test execution completed", "success");
    log(`Results: ${JSON.stringify(results, null, 2)}`);
  })
  .catch((error) => {
    log(`Test execution failed: ${error.message}`, "error");
    process.exit(1);
  });
