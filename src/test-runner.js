import { log, handleError } from "./helpers.js";
import axios from "axios";
import createTunnel from "./tunnel.js";

class RegressionTestRunner {
  constructor(baseUrl, projectId, emails, port, localHost, prefix) {
    this.port = port;
    this.localHost = localHost;
    this.baseUrl = baseUrl;
    this.projectId = projectId;
    this.emails = emails;
    this.prefix = prefix;
    this.tunnelUrl = null;
    this.axios = axios.create({
      baseURL: this.baseUrl,
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
          baseUrl: this.tunnelUrl,
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
      this.tunnelUrl = await createTunnel(this.port, this.localHost);
      if (this.prefix && this.prefix !== "") {
        this.prefix = this.prefix.replace(/^\/+|\/+$/g, "");
        this.tunnelUrl = `${this.tunnelUrl}/${this.prefix}`;
      }

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
}

export default RegressionTestRunner;
