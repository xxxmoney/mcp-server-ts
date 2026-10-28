import type { z } from "zod";
import type { RegisterToolFunction } from "./mcp.ts";
import { createHttpServer, type HttpConfig } from "./protocol/http.ts";
import { createStdioServer } from "./protocol/stdio.ts";
import { registerTool, type Tool } from "./tool.ts";

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

	tool<T extends z.ZodRawShape>(tool: Tool<T>) {
		this.registerTools.push((mcp) => registerTool(mcp, tool));
	}

	startHttp(httpConfig: HttpConfig) {
		return createHttpServer(httpConfig, {
			...this.appConfig,
			registerTools: this.registerTools,
		});
	}
	async startStdio() {
		return await createStdioServer({
			...this.appConfig,
			registerTools: this.registerTools,
		});
	}
}
