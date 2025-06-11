import localtunnel from "localtunnel";
import { log, handleError } from "./helpers.js";

const createTunnel = async (port, localHost) => {
  try {
    log(`Creating tunnel for port ${port} and host ${localHost}...`);

    const options = {
      port: parseInt(port),
      local_host: localHost,
      allow_invalid_cert: true,
      subdomain: `drcode-${Date.now()}`,
      retry: {
        min: 1000,
        max: 5000,
        retries: 5,
      },
    };

    log(`Tunnel options: ${JSON.stringify(options)}`, "info");

    // Add connection timeout
    const tunnelPromise = localtunnel(options);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Tunnel connection timeout")), 30000);
    });

    const tunnel = await Promise.race([tunnelPromise, timeoutPromise]);
    log("Tunnel object created", "info");

    if (!tunnel) {
      throw new Error("Tunnel object is null");
    }

    if (!tunnel.url) {
      throw new Error("Tunnel URL is undefined");
    }

    const tunnelUrl = tunnel.url;
    log(`Tunnel created successfully: ${tunnelUrl}`, "success");

    // Handle tunnel close
    tunnel.on("close", () => {
      log("Tunnel closed", "info");
    });

    // Handle tunnel error
    tunnel.on("error", (err) => {
      log(`Tunnel error occurred: ${err.message}`, "error");
      handleError({ message: `Tunnel error: ${err.message}` });
    });

    // Keep the process running
    process.on("SIGINT", () => {
      log("Received SIGINT. Closing tunnel...", "info");
      tunnel.close();
      process.exit(0);
    });

    process.on("SIGTERM", () => {
      log("Received SIGTERM. Closing tunnel...", "info");
      tunnel.close();
      process.exit(0);
    });

    // Wait for tunnel to be ready
    log("Waiting for tunnel to be ready...");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    return tunnelUrl;
  } catch (error) {
    log(`Detailed error: ${error.stack}`, "error");
    handleError({ message: `Failed to create tunnel: ${error.message}` });
  }
};

export default createTunnel;
