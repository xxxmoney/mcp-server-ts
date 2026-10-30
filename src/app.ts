import type { z } from "zod";
import type { RegisterToolFunction } from "./mcp";
import { createHttpServer, type HttpConfig } from "./protocol/http";
import { createStdioServer } from "./protocol/stdio";
import { registerTool, type Tool } from "./tool";

export interface AppConfig {
	name: string;
	version: string;
}

export class McpApp {
	private readonly appConfig: AppConfig;
	private readonly registerTools: RegisterToolFunction[] = [];

	constructor(config: AppConfig) {
		this.appConfig = config;
	}

	registerTool<T extends z.ZodRawShape>(tool: Tool<T>) {
		this.registerTools.push((mcp) => registerTool(mcp, tool));
	}

	async startHttpServer(httpConfig: HttpConfig) {
		const server = await createHttpServer(httpConfig, {
			...this.appConfig,
			registerTools: this.registerTools,
		});
		await server.ready();

		return server;
	}
	async startStdioServer() {
		return await createStdioServer({
			...this.appConfig,
			registerTools: this.registerTools,
		});
	}
}
