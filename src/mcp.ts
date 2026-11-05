import { McpServer } from "@modelcontextprotocol/server";
import type { AppConfig } from "./app";

export type RegisterToolFunction = (mcp: McpServer) => void;
export interface McpServerConfig extends AppConfig {
	registerTools: RegisterToolFunction[];
}

export function createMcpServer(config: McpServerConfig) {
	const mcp = new McpServer(config);

	mcp.server.onerror = (error) => {
		console.error("MCP error: ", error);
	};

	for (const registerTool of config.registerTools) {
		registerTool(mcp);
	}

	return mcp;
}
