import { McpServer } from "@modelcontextprotocol/server";
import type { z } from "zod";
import type { AppConfig } from "./app.ts";
import { registerTool, type Tool } from "./tool.ts";

export interface McpServerConfig extends AppConfig {
	tools: Tool<z.ZodRawShape>[];
}

export function createMcpServer(config: McpServerConfig) {
	const mcp = new McpServer(config);

	mcp.server.onerror = (error) => {
		console.error("MCP error: ", error);
	};

	for (const tool of config.tools) {
		registerTool(mcp, tool);
	}

	return mcp;
}
