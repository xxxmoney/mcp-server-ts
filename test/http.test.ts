import type { AddressInfo } from "node:net";
import { expect, test } from "vitest";
import { app, INITIALIZE_DATA, TOOL_DATA, TOOL_NAME } from "./helpers/app";
import { parseData } from "./helpers/parser";

test("Run app http server", async () => {
	const HOST = "localhost";
	const PORT = 0; // dynamically assign port

	// Arrange
	const server = await app.startHttpServer({
		host: HOST,
		port: PORT,
	});

	// Check if server ready
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
		body: JSON.stringify(INITIALIZE_DATA),
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
		body: JSON.stringify(TOOL_DATA),
	});
	const toolText = await tool.text();
	const data = parseData(toolText);
	expect(data).toBeDefined();
	expect(data?.result?.content?.[0].text).toBe("Hello");

	// Cleanup
	await server.close();
});
