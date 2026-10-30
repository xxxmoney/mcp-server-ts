
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
  
    // Register tool (can be done multiple times for different tools)
    app.registerTool({
        config: {
            // Unique name to other tools
            title: "Test Tool", 
            // What the tool does (so the LLM knows what's up)
            description: "Returns the sent message",
            // Validation schema for input value (using zod)
            valueSchema: z.object({
                message: z.string(),
            }),
        },
        // How to handle the request to the tool
        // Provides the value (validated by the schema), a logger, an error logger, and the context of the MCP Server
        handler: async (value, { log, error, context }) => {
            log(`Got message: '${value.message}'`);
    
            return value.message; // Can return string or array of objects { type: "text"; text: string }
        },
    });
  
    // Start the http server
    await app.startHttpServer({
        host: 'localhost',
        port: 666,
    });
  
    // And/Or start the stdio server
    // Logging is automatically redirected either to docker log, or to console.error (as not to pollute stdout)
    await app.startStdioServer();
  ```

