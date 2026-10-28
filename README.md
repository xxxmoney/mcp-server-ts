
# MCP Server TS

## About
- Simple package for creating MCP Server with TypeScript

## Getting started
- Install package using npm (or other package manager)
  - `npm install mcp-server-ts`

## Usage
- Import the package and create a new server instance
- You can specify tools (along the schema, handler, etc), and start the server using either HTTP or stdio.
  ```typescript
    import { z } from "zod";
    import { McpApp } from 'mcp-server-ts';

    // Create a new Mcp App instance
    const app = new McpApp({ name: "TestApp", version: "1.0.0" });
  
    // Specify a tool 
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
  
    // Start the http server
    await app.startHttp({
        host: 'localhost',
        port: 666,
    });
  
    // Or start the stdio server
    await app.startStdio();
  ```

