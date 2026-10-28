import type { McpServer, ServerContext } from "@modelcontextprotocol/server";
import type { z } from "zod";

type ToolConfig<T extends z.ZodRawShape> = {
	title: string;
	description: string;
	valueSchema: z.ZodObject<T>;
};
type ToolHandlerItemOutput = { type: string; text: string };
type ToolHandlerOutput = {
	content: ToolHandlerItemOutput[];
};
type ToolHandler<T extends z.ZodRawShape> = (
	value: z.infer<z.ZodObject<T>>,
	extra: {
		log: (message: string) => void;
		error: (message: string) => void;
		context: ServerContext;
	},
) => ToolHandlerOutput | Promise<ToolHandlerOutput>;

export type Tool<T extends z.ZodRawShape> = {
	config: ToolConfig<T>;
	handler: ToolHandler<T>;
};

export function registerTool<T extends z.ZodRawShape>(
	mcp: McpServer,
	tool: Tool<T>,
) {
	mcp.registerTool(
		tool.config.title,
		{
			description: tool.config.description,
			inputSchema: tool.config.valueSchema,
		},
		async (value, extra) => {
			const log = (message: string) => {
				console.log(`[${extra.sessionId ?? "stdio"}] ${message}`);
			};
			const error = (message: string) => {
				console.error(`[${extra.sessionId ?? "stdio"}] ${message}`);
			};

			try {
				return await tool.handler(value, {
					log: log,
					error: error,
					context: extra,
				});
			} catch (err) {
				error(
					`Failed to execute tool '${tool.config.title}': ${err instanceof Error ? err.message : err}`,
				);

				throw err;
			}
		},
	);
}
