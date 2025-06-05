const axios = require("axios");

// Helper function for consistent logging
const log = (message, type = "info") => {
  const timestamp = new Date().toISOString();
  const prefix = type === "error" ? "❌" : type === "success" ? "✅" : "ℹ️";
  console.log(`[${timestamp}] ${prefix} ${message}`);
};

// Helper function to format test results
const formatTestResults = (results) => {
  if (!results || !results.data) {
    return "No test results available";
  }

  const tests = results.data;
  const summary = {
    total: tests.length,
    passed: tests.filter((t) => t.last_run_status === "PASSED").length,
    failed: tests.filter((t) => t.last_run_status === "FAILED").length,
    pending: tests.filter((t) => !t.last_run_status).length,
  };

  let output = "\n📊 Test Results Summary:\n";
  output += "=====================\n";
  output += `Total Tests: ${summary.total}\n`;
  output += `✅ Passed: ${summary.passed}\n`;
  output += `❌ Failed: ${summary.failed}\n`;
  output += `⏳ Pending: ${summary.pending}\n\n`;

  output += "📝 Detailed Results:\n";
  output += "=====================\n";

  tests.forEach((test, index) => {
    const status =
      test.last_run_status === "PASSED"
        ? "✅"
        : test.last_run_status === "FAILED"
        ? "❌"
        : "⏳";
    const lastRun = test.last_run_at
      ? new Date(test.last_run_at).toLocaleString()
      : "Never";

    output += `${index + 1}. ${test.name}\n`;
    output += `   Status: ${status} ${test.last_run_status || "Not Run"}\n`;
    output += `   Last Run: ${lastRun}\n`;
    if (test.description) {
      output += `   Description: ${test.description}\n`;
    }
    output += "\n";
  });

  return output;
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

  async getAllTests() {
    try {
      log("Fetching all senario tests...");
      const response = await axios.get(
        `${this.baseUrl}/api/regressionTest/project/${this.projectId}`
      );

      if (!response.data.data || response.data.data.length === 0) {
        throw new Error("No test scenarios found for this project");
      }

      log("Test results retrieved successfully", "success");
      return response.data;
    } catch (error) {
      log(`Failed to get test results: ${error.message}`, "error");
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

const tester = new RegressionTestRunner(baseUrl, projectId, emails);

// Run tests and exit with appropriate status codes
tester
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
  })
  .catch((error) => {
    log(`Test execution failed: ${error.message}`, "error");
    process.exit(1);
  });
