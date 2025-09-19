#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import { initializeDatabase } from './database/config.js';
import { WORKFLOW_TOOLS, handleWorkflowTool, WORKFLOW_RESOURCES, handleWorkflowResource } from './workflow/index.js';

type DatabaseHandles = ReturnType<typeof initializeDatabase>;

export let dbHandle: DatabaseHandles['db'] | null = null;
export let sqliteHandle: DatabaseHandles['sqlite'] | null = null;

export function getDatabaseHandles(): DatabaseHandles | null {
  if (!dbHandle || !sqliteHandle) {
    return null;
  }

  return { db: dbHandle, sqlite: sqliteHandle };
}

// Initialize the MCP server
const server = new Server(
  {
    name: 'workout-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      ...WORKFLOW_TOOLS,
      // Additional tools will be added in subsequent tasks
    ],
  };
});

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: WORKFLOW_RESOURCES
  };
});

// Handle resource reads
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  return await handleWorkflowResource(uri);
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  // Check if it's a workflow tool
  if (WORKFLOW_TOOLS.some(tool => tool.name === name)) {
    return await handleWorkflowTool(name, args || {});
  }
  
  switch (name) {
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Start the server
async function main() {
  const handles = initializeDatabase();
  dbHandle = handles.db;
  sqliteHandle = handles.sqlite;

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Workout MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
