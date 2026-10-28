import fs from "node:fs";
import { format } from "node:util";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { createMcpServer, type McpServerConfig } from "../mcp.ts";

export async function createStdioServer(mcpServerConfig: McpServerConfig) {
	let log = console.error;

	// Check docker log file exists
	if (fs.existsSync("/proc/1/fd/1")) {
		try {
			const dockerLog = fs.createWriteStream("/proc/1/fd/1", { flags: "a" });
			dockerLog.on("error", () => {}); // Prevent crash if pipe closes
			log = (...args: unknown[]) => dockerLog.write(`${format(...args)}\n`);
		} catch {
			// Fallback to stderr
		}
	}

	console.debug = log;
	console.log = log;
	console.info = log;
	console.warn = log;
	console.error = log;

	const transport = new StdioServerTransport();
	const mcp = createMcpServer(mcpServerConfig);
	await mcp.connect(transport);

	return transport;
}
