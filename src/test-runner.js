import { log, handleError } from "./helpers.js";
import axios from "axios";
import localtunnel from "localtunnel";

class RegressionTestRunner {
  tunnelUrl = null;
  constructor(baseUrl, projectId, emails, port, localHost) {
    this.port = port;
    this.localHost = localHost;
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
      handleError({ message: `Failed to run tests: ${error.message}` });
    }
  }

  async getAllTests() {
    try {
      log("Fetching all senario tests...");
      const response = await axios.get(
        `${this.baseUrl}/api/regressionTest/project/${this.projectId}`
      );

      if (!response.data.data || response.data.data.length === 0) {
        handleError({ message: "No test scenarios found for this project" });
      }

      log("Test results retrieved successfully", "success");
      return response.data;
    } catch (error) {
      handleError({ message: `Failed to get test results: ${error.message}` });
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
      handleError({ message: `Failed to get test results: ${error.message}` });
    }
  }

  async createTunnel() {
    try {
      const tunnel = await localtunnel({
        port: this.port,
        local_host: this.localHost,
        host: "http://localhost:3000",
        subdomain: `localtest-${Date.now()}`,
      });
      this.tunnelUrl = tunnel.url;
      log(`Tunnel created: ${this.tunnelUrl}`, "success");

      // Keep process alive
      setInterval(() => {}, 1000);

      return this.tunnelUrl;
    } catch (error) {
      handleError({ message: `Failed to create tunnel: ${error.message}` });
    }
  }
}

export default RegressionTestRunner;