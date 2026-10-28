import type { AddressInfo } from "node:net";
import { expect, test } from "vitest";
import { z } from "zod";
import { McpApp } from "../src/app";

test("Run app http server", async () => {
	const HOST = "localhost";
	const PORT = 0; // dynamically assign port
	const TOOL_NAME = "test-tool";

	// Arrange
	const app = new McpApp({ name: "TestApp", version: "1.0.0" });
	app.tool({
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
	const server = await app.startHttp({
		host: HOST,
		port: PORT,
	});

	// Check if server ready
	await server.ready();
	const address = server.server.address() as AddressInfo;

	// Health check
	const url = `http://${HOST}:${address.port}`;
	const healthCheck = await fetch(url);
	expect(healthCheck.status).toBe(200);
	expect(await healthCheck.text()).toBe("I am alive!");

	// Initialize
	const initialize = await fetch(`${url}/mcp`, {
		method: "POST",
		headers: {
			"content-type": "application/json",
			accept: "application/json, text/event-stream",
		},
		body: JSON.stringify({
			jsonrpc: "2.0",
			id: 1,
			method: "initialize",
			params: {
				protocolVersion: "2024-11-05",
				capabilities: {},
				clientInfo: { name: "test-client", version: "1.0.0" },
			},
		}),
	});
	const sessionId = initialize.headers.get("mcp-session-id");
	expect(sessionId).toBeDefined();

	// Tool call
	const tool = await fetch(`${url}/mcp`, {
		method: "POST",
		headers: {
			"content-type": "application/json",
			accept: "application/json, text/event-stream",
			"mcp-session-id": sessionId ?? "",
		},
		body: JSON.stringify({
			jsonrpc: "2.0",
			id: 2,
			method: "tools/call",
			params: {
				name: TOOL_NAME,
				arguments: { message: "Hello" },
			},
		}),
	});
	const toolText = await tool.text();
	const result = toolText
		.split("\n")
		.find((line) => line.startsWith("data:"))
		?.replace("\n", "")
		?.replace("data:", "\n");
	expect(result).toBeDefined();

	const toolObject = JSON.parse(result ?? "{}");
	const toolContent = toolObject.result.content[0];
	expect(toolContent.text).toBe("Hello");

	// Cleanup
	await server.close();
});

// TODO: maybe add stdio test?
