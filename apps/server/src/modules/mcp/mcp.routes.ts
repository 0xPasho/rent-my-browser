import { Router, type Router as RouterType } from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpServer } from "./mcp.server.js";

const router: RouterType = Router();

router.post("/mcp", async (req, res) => {
  const server = createMcpServer();

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  let closed = false;
  const closeAll = async (): Promise<void> => {
    if (closed) return;
    closed = true;
    await Promise.allSettled([transport.close(), server.close()]);
  };

  res.on("close", () => {
    void closeAll();
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (err: any) {
    await closeAll();
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal server error" },
        id: null,
      });
    }
  }
});

router.get("/mcp", async (_req, res) => {
  res.status(405).json({
    jsonrpc: "2.0",
    error: { code: -32000, message: "Method not allowed. Use POST." },
    id: null,
  });
});

router.delete("/mcp", async (_req, res) => {
  res.status(405).json({
    jsonrpc: "2.0",
    error: { code: -32000, message: "Session management not supported." },
    id: null,
  });
});

export { router as mcpRoutes };
