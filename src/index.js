const axios = require("axios");

class CalculatorAPITester {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.axios = axios.create({
      baseURL: baseUrl,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async testHealth() {
    try {
      const response = await this.axios.get("/health");
      return response.data.status === "healthy";
    } catch (error) {
      console.error("Health check failed:", error.message);
      return false;
    }
  }

  async testSum(num1, num2) {
    try {
      const response = await this.axios.post("/api/calculator/sum", {
        num1,
        num2,
      });
      return response.data.result === num1 + num2;
    } catch (error) {
      console.error("Sum test failed:", error.message);
      return false;
    }
  }

  async testMultiply(num1, num2) {
    try {
      const response = await this.axios.post("/api/calculator/multiply", {
        num1,
        num2,
      });
      return response.data.result === num1 * num2;
    } catch (error) {
      console.error("Multiply test failed:", error.message);
      return false;
    }
  }

  async runAllTests() {
    console.log("Starting API tests...");

    const healthResult = await this.testHealth();
    console.log("Health Check:", healthResult ? "PASSED" : "FAILED");

    const sumResult = await this.testSum(5, 3);
    console.log("Sum Test:", sumResult ? "PASSED" : "FAILED");

    const multiplyResult = await this.testMultiply(5, 3);
    console.log("Multiply Test:", multiplyResult ? "PASSED" : "FAILED");

    const allPassed = healthResult && sumResult && multiplyResult;
    console.log(
      "\nOverall Result:",
      allPassed ? "ALL TESTS PASSED" : "SOME TESTS FAILED"
    );

    return allPassed;
  }
}

// Get the base URL from environment variable or use default
const baseUrl = process.env.CALCULATOR_API_URL || "http://localhost:3000";
const tester = new CalculatorAPITester(baseUrl);

// Run tests and exit with appropriate status code
tester
  .runAllTests()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("Test execution failed:", error);
    process.exit(1);
  });
