import type { z } from "zod";
import { createHttpServer, type HttpConfig } from "./protocol/http.ts";
import { createStdioServer } from "./protocol/stdio.ts";
import type { Tool } from "./tool.ts";

export interface AppConfig {
	name: string;
	version: string;
}

export class McpApp {
	private readonly appConfig: AppConfig;
	private readonly tools: Tool<z.ZodRawShape>[] = [];

	constructor(config: AppConfig) {
		this.appConfig = config;
	}

	tool(tool: Tool<z.ZodRawShape>) {
		this.tools.push(tool);
	}

	startHttp(httpConfig: HttpConfig) {
		return createHttpServer(httpConfig, {
			...this.appConfig,
			tools: this.tools,
		});
	}
	async startStdio() {
		return await createStdioServer({
			...this.appConfig,
			tools: this.tools,
		});
	}
}
