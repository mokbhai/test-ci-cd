import localtunnel from "localtunnel";
import { log, handleError } from "./helpers.js";

const createTunnel = async (port, localHost) => {
  try {
    log(`Creating tunnel for port ${port} and host ${localHost}...`);

    const options = {
      port: parseInt(port),
      local_host: localHost,
    };

    log(`Tunnel options: ${JSON.stringify(options)}`, "info");

    const tunnel = await localtunnel(options);
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

    return tunnelUrl;
  } catch (error) {
    log(`Detailed error: ${error.stack}`, "error");
    handleError({ message: `Failed to create tunnel: ${error.message}` });
  }
};

export default createTunnel;
