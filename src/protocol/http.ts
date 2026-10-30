import { randomUUID } from "node:crypto";
import cors from "@fastify/cors";
import { createMcpFastifyApp } from "@modelcontextprotocol/fastify";
import { NodeStreamableHTTPServerTransport } from "@modelcontextprotocol/node";
import { isInitializeRequest } from "@modelcontextprotocol/server";
import { SESSION_ID_HEADER } from "../constants";
import { createMcpServer, type McpServerConfig } from "../mcp";

export type HttpConfig = {
	host: string;
	port: number;
};

export async function createHttpServer(
	httpConfig: HttpConfig,
	mcpServerConfig: McpServerConfig,
) {
	const connections = new Map<string, NodeStreamableHTTPServerTransport>();

	const server = createMcpFastifyApp();
	server.register(cors, {});
	server.addHook("onRequest", (request, _, done) => {
		console.log(`[HTTP] ${request.method} ${request.url}`);
		done();
	});

	// Handle health check
	server.get("/", async () => {
		return "I am alive!";
	});

	// Handle HTTP streaming MCP requests
	server.all("/mcp", async (request, reply) => {
		const sessionId = request.headers[SESSION_ID_HEADER] as string | undefined;

		if (!sessionId && !isInitializeRequest(request.body)) {
			console.warn(`Session id not specified in headers`);
			reply.status(404).send({
				jsonrpc: "2.0",
				error: {
					code: -32_000,
					message: `Session id not specified in headers as '${SESSION_ID_HEADER}'`,
				},
				id: null,
			});
			return;
		}

		let connection = sessionId ? connections.get(sessionId) : undefined;
		if (!connection) {
			console.log(`['${sessionId}'] session initializing...`);
			connection = new NodeStreamableHTTPServerTransport({
				sessionIdGenerator: () => randomUUID(),
				onsessioninitialized: (sessionId) => {
					if (!connection) {
						console.error(`['${sessionId}'] connection undefined`);
						return;
					}

					connections.set(sessionId, connection);
					console.log(`['${sessionId}'] session initialized`);
				},
				onsessionclosed: (sessionId) => {
					connections.delete(sessionId);
					console.log(`['${sessionId}'] session closed`);
				},
			});

			const mcp = createMcpServer(mcpServerConfig);
			await mcp.connect(connection);
		}

		await connection.handleRequest(request.raw, reply.raw, request.body);
	});

	const address = await server.listen({
		host: httpConfig.host,
		port: httpConfig.port,
	});
	console.log(`Server listening at ${address}`);

	return server;
}
