import { z } from "zod";
import { McpApp } from "../../src";

export const APP_NAME = "TestApp";
export const TOOL_NAME = "test-tool";

export const INITIALIZE_DATA = {
	jsonrpc: "2.0",
	id: 1,
	method: "initialize",
	params: {
		protocolVersion: "2024-11-05",
		capabilities: {},
		clientInfo: { name: "test-client", version: "1.0.0" },
	},
};

export const TOOL_DATA = {
	jsonrpc: "2.0",
	id: 2,
	method: "tools/call",
	params: {
		name: TOOL_NAME,
		arguments: { message: "Hello" },
	},
};

export const app = new McpApp({ name: APP_NAME, version: "1.0.0" });
app.registerTool({
	config: {
		title: TOOL_NAME,
		description: "A test tool",
		valueSchema: z.object({
			message: z.string(),
		}),
	},
	handler: async (value, { log }) => {
		log(`Got message: '${value.message}'`);

		return value.message;
	},
});
