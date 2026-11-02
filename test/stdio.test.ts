import { expect, test } from "vitest";
import { app } from "./helpers/app";

test("Run app stdio server", async () => {
	// Arrange
	const server = await app.startStdioServer();

	// Cleanup
	await server.close();
});

// TODO: maybe add stdio test?
