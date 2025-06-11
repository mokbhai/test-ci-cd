// Helper function for consistent logging
const log = (message, type = "info") => {
  const timestamp = new Date().toISOString();
  const prefix = type === "success" ? "✅" : "ℹ️";
  console.log(`[${timestamp}] ${prefix} ${message}`);
};

// Helper function to handle errors and exit
const handleError = (error) => {
  console.error(`[${new Date().toISOString()}] ❌ ${error.message}`);
  process.exit(1);
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

export {
  log,
  handleError,
  formatTestResults,
};
