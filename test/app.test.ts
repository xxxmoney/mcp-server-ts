import type { AddressInfo } from "node:net";
import { expect, test } from "vitest";
import { z } from "zod";
import { McpApp } from "../src/app";

test("Run app http server", async () => {
	const HOST = "localhost";
	const PORT = 2222;

	// Arrange
	const app = new McpApp({ name: "TestApp", version: "1.0.0" });
	app.tool({
		config: {
			title: "test-tool",
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
	const server = app.startHttp({
		host: HOST,
		port: PORT,
	});

	// Act / Assert
	await server.ready();

	const response = await fetch(`http://${HOST}:${PORT}/`);
	expect(response.status).toBe(200);
	expect(await response.text()).toBe("I am alive!");

	// Cleanup
	await server.close();
});
