import { spawn } from "node:child_process";
import { expect, test } from "vitest";
import { APP_NAME, INITIALIZE_DATA, TOOL_DATA } from "./helpers/app";
import { type Data, parseData } from "./helpers/parser";

test("Run app stdio server", async () => {
	// Arrange
	const child = spawn("tsx", ["test/helpers/stdio.ts"], {
		stdio: ["pipe", "pipe", "pipe"],
		shell: true,
	});

	const send = (msg: unknown) => {
		child.stdin.write(`${JSON.stringify(msg)}\n`);
	};
	const read = (): Promise<Data> => {
		return new Promise((resolve) => {
			child.stdout.once("data", (chunk) => {
				resolve(parseData(chunk.toString()));
			});
		});
	};

	try {
		// Initialize
		send(INITIALIZE_DATA);
		const initialize = await read();
		expect(initialize?.result?.serverInfo?.name).toBe(APP_NAME);

		// Tool call
		send(TOOL_DATA);
		const tool = await read();
		expect(tool?.result?.content?.[0].text).toBe("Hello");
	} finally {
		// Cleanup
		const hasKilled = child.kill();
		expect(hasKilled).toBe(true);
	}
});
