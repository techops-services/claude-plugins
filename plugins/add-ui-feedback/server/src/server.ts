import http from "node:http";
import crypto from "node:crypto";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { FeedbackStore, ResponseStore } from "./store.js";
import type { FeedbackEntry, ResponseEntry } from "./types.js";

const feedbackStore = new FeedbackStore();
const responseStore = new ResponseStore();

type SSEClient = http.ServerResponse;
const sseClients = new Set<SSEClient>();

function broadcastSSE(event: string, data: unknown): void {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    client.write(payload);
  }
}

function formatFeedbackMarkdown(entry: FeedbackEntry): string {
  const lines: string[] = [
    `# UI Feedback: ${entry.pageTitle}`,
    "",
    `Source: ${entry.sourceFile}`,
    `URL: ${entry.pageUrl}`,
    `Feedback ID: ${entry.id}`,
    "",
  ];

  for (let i = 0; i < entry.annotations.length; i++) {
    const ann = entry.annotations[i];
    lines.push(`## ${i + 1}. ${ann.section} > ${ann.label}`);
    lines.push(`Element: ${ann.selector}`);
    lines.push(`HTML: ${ann.outerHtml}`);
    lines.push("");
    lines.push(ann.text);
    lines.push("");
  }

  return lines.join("\n");
}

function setCorsHeaders(res: http.ServerResponse): void {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function sendJson(
  res: http.ServerResponse,
  status: number,
  data: unknown,
): void {
  setCorsHeaders(res);
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString()));
    req.on("error", reject);
  });
}

export function createHttpServer(
  port: number,
  verbose: boolean,
): http.Server {
  const server = http.createServer(
    async (req: http.IncomingMessage, res: http.ServerResponse) => {
      const url = new URL(req.url ?? "/", `http://localhost:${port}`);
      const path = url.pathname;

      if (req.method === "OPTIONS") {
        setCorsHeaders(res);
        res.writeHead(204);
        res.end();
        return;
      }

      if (path === "/feedback" && req.method === "POST") {
        try {
          const body = await readBody(req);
          const data = JSON.parse(body);
          const entry: FeedbackEntry = {
            id: crypto.randomUUID(),
            sourceFile: data.sourceFile ?? "",
            pageTitle: data.pageTitle ?? "",
            pageUrl: data.pageUrl ?? "",
            annotations: data.annotations ?? [],
            receivedAt: Date.now(),
            processed: false,
          };
          feedbackStore.add(entry);
          broadcastSSE("feedback_received", entry);
          if (verbose) {
            process.stderr.write(
              `[http] Received feedback ${entry.id} with ${entry.annotations.length} annotations\n`,
            );
          }
          sendJson(res, 200, { id: entry.id, received: true });
        } catch (err) {
          if (verbose) {
            process.stderr.write(
              `[http] Error processing feedback: ${err}\n`,
            );
          }
          sendJson(res, 400, { error: "Invalid JSON body" });
        }
        return;
      }

      if (path === "/events" && req.method === "GET") {
        setCorsHeaders(res);
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        });

        res.write(`event: connected\ndata: ${JSON.stringify({ status: "ok" })}\n\n`);
        sseClients.add(res);

        const keepAlive = setInterval(() => {
          res.write(": ping\n\n");
        }, 30_000);

        req.on("close", () => {
          clearInterval(keepAlive);
          sseClients.delete(res);
        });
        return;
      }

      if (path === "/health" && req.method === "GET") {
        sendJson(res, 200, {
          status: "ok",
          pending_feedback: feedbackStore.pendingCount,
          pending_responses: responseStore.pendingCount,
        });
        return;
      }

      sendJson(res, 404, { error: "Not found" });
    },
  );

  server.listen(port, () => {
    process.stderr.write(
      `[ui-feedback] HTTP server listening on port ${port}\n`,
    );
  });

  return server;
}

export async function createMcpServer(verbose: boolean): Promise<void> {
  const server = new Server(
    {
      name: "ui-feedback-bridge",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "feedback_get",
        description:
          "Get the oldest pending UI feedback entry formatted as markdown. Marks it as processed.",
        inputSchema: {
          type: "object" as const,
          properties: {},
        },
      },
      {
        name: "feedback_list",
        description:
          "List all pending UI feedback entries with summaries.",
        inputSchema: {
          type: "object" as const,
          properties: {},
        },
      },
      {
        name: "feedback_respond",
        description:
          "Send a response message back to the browser for a specific feedback entry.",
        inputSchema: {
          type: "object" as const,
          properties: {
            feedback_id: {
              type: "string",
              description: "The feedback entry ID to respond to.",
            },
            message: {
              type: "string",
              description: "The response message to send.",
            },
          },
          required: ["feedback_id", "message"],
        },
      },
      {
        name: "feedback_watch",
        description:
          "Wait for new feedback to arrive. Polls every second until feedback is received or timeout is reached.",
        inputSchema: {
          type: "object" as const,
          properties: {
            timeout: {
              type: "number",
              description:
                "Maximum seconds to wait. Defaults to 300.",
            },
          },
        },
      },
      {
        name: "feedback_clear",
        description:
          "Clear processed feedback entries. Optionally clear a specific entry by ID.",
        inputSchema: {
          type: "object" as const,
          properties: {
            id: {
              type: "string",
              description:
                "Specific feedback ID to clear. If omitted, clears all processed entries.",
            },
          },
        },
      },
    ],
  }));

  server.setRequestHandler(
    CallToolRequestSchema,
    async (request) => {
      const { name, arguments: args } = request.params;

      if (name === "feedback_get") {
        const entry = feedbackStore.getOldestPending();
        if (!entry) {
          return {
            content: [
              { type: "text", text: "No pending feedback." },
            ],
          };
        }
        feedbackStore.markProcessed(entry.id);
        if (verbose) {
          process.stderr.write(
            `[mcp] Served feedback ${entry.id}\n`,
          );
        }
        return {
          content: [
            {
              type: "text",
              text: formatFeedbackMarkdown(entry),
            },
          ],
        };
      }

      if (name === "feedback_list") {
        const pending = feedbackStore.getPending();
        if (pending.length === 0) {
          return {
            content: [
              { type: "text", text: "No pending feedback." },
            ],
          };
        }
        const summary = pending
          .map(
            (e) =>
              `- ${e.id} | "${e.pageTitle}" | ${e.annotations.length} annotation(s) | ${new Date(e.receivedAt).toISOString()}`,
          )
          .join("\n");
        return {
          content: [
            {
              type: "text",
              text: `Pending feedback (${pending.length}):\n${summary}`,
            },
          ],
        };
      }

      if (name === "feedback_respond") {
        const feedbackId = (args as Record<string, unknown>)
          ?.feedback_id as string;
        const message = (args as Record<string, unknown>)
          ?.message as string;
        if (!feedbackId || !message) {
          return {
            content: [
              {
                type: "text",
                text: "Error: feedback_id and message are required.",
              },
            ],
            isError: true,
          };
        }
        const response: ResponseEntry = {
          id: crypto.randomUUID(),
          feedbackId,
          message,
          sentAt: Date.now(),
          delivered: false,
        };
        responseStore.add(response);
        broadcastSSE("response", response);
        if (verbose) {
          process.stderr.write(
            `[mcp] Response sent for feedback ${feedbackId}\n`,
          );
        }
        return {
          content: [
            {
              type: "text",
              text: `Response sent (ID: ${response.id}) for feedback ${feedbackId}.`,
            },
          ],
        };
      }

      if (name === "feedback_watch") {
        const timeout =
          ((args as Record<string, unknown>)?.timeout as number) ??
          300;
        const deadline = Date.now() + timeout * 1000;

        while (Date.now() < deadline) {
          const entry = feedbackStore.getOldestPending();
          if (entry) {
            feedbackStore.markProcessed(entry.id);
            if (verbose) {
              process.stderr.write(
                `[mcp] Watch found feedback ${entry.id}\n`,
              );
            }
            return {
              content: [
                {
                  type: "text",
                  text: formatFeedbackMarkdown(entry),
                },
              ],
            };
          }
          await new Promise((resolve) =>
            setTimeout(resolve, 1000),
          );
        }

        return {
          content: [
            {
              type: "text",
              text: `No feedback received within ${timeout}s timeout.`,
            },
          ],
        };
      }

      if (name === "feedback_clear") {
        const id = (args as Record<string, unknown>)?.id as
          | string
          | undefined;
        const cleared = feedbackStore.clear(id);
        return {
          content: [
            {
              type: "text",
              text: id
                ? cleared > 0
                  ? `Cleared feedback ${id}.`
                  : `Feedback ${id} not found or not yet processed.`
                : `Cleared ${cleared} processed feedback entry/entries.`,
            },
          ],
        };
      }

      return {
        content: [
          { type: "text", text: `Unknown tool: ${name}` },
        ],
        isError: true,
      };
    },
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write("[ui-feedback] MCP server started on stdio\n");
}
