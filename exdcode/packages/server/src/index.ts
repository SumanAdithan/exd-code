import { Hono } from "hono";
import { sentry } from "@sentry/hono/bun";
import { HTTPException } from "hono/http-exception";
import * as Sentry from "@sentry/hono/bun";

import sessions from "./routes/sessions";
import chat from "./routes/chat";

const app = new Hono();

app.use(
  sentry(app, {
    dsn: "https://bebdc054130242b47f84a798b8a19c87@o4511693027344384.ingest.us.sentry.io/4511693035601920",
    tracesSampleRate: 1.0,
    enableLogs: true,
    dataCollection: {},
  }),
);

app.get("/debug-sentry", () => {
  Sentry.logger.info("User triggered test error", {
    action: "test_error_endpoint",
  });
  Sentry.metrics.count("test_counter", 1);
  throw new Error("My first Sentry error!");
});

app.onError((error, c) => {
  if (error instanceof HTTPException) {
    Sentry.logger.warn("Handled HTTP error", {
      status: error.status,
      message: error.message || "Request failed",
      path: c.req.path,
      method: c.req.method,
    });

    return c.json(
      {
        error: error.message || "Request failed",
      },
      error.status,
    );
  }

  Sentry.logger.error("Unhandled sever error", {
    path: c.req.path,
    method: c.req.method,
    message: error instanceof Error ? error.message : "Unknown error",
  });

  return c.json({ error: "Internal server error" }, 500);
});

const routes = app.route("/sessions", sessions).route("/chat", chat);

export type AppType = typeof routes;

// idleTimeout must be high, otherwise LLM tool calls might not complete
export default { port: 5000, fetch: app.fetch, idleTimeout: 255 };
