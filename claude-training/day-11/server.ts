import { readFileSync } from "node:fs";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { submitCartItem, toCartPageView, createCartPageState } from "./cart-page.ts";
import { CART_PAGE_HOST, CART_PAGE_PORT } from "./constants.ts";
import { renderCartPage } from "./render-page.ts";
import type { CartPageState, CartPageView } from "./types.ts";

const pageDir: string = dirname(fileURLToPath(import.meta.url));
const template: string = readFileSync(join(pageDir, "index.html"), "utf8");
const maxBodyBytes: number = 2048;

let pageState: CartPageState = createCartPageState();

/** Read a small form body, and reject anything larger. */
const readBody = async (request: IncomingMessage): Promise<string> => {
  const chunks: Buffer[] = [];
  let size: number = 0;

  for await (const chunk of request) {
    const buffer: Buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > maxBodyBytes) {
      throw new Error("Form body is too large.");
    }
    chunks.push(buffer);
  }

  return Buffer.concat(chunks).toString("utf8");
};

/** Send the cart page for the current view. */
const sendPage = (response: ServerResponse, view: CartPageView): void => {
  const html: string = renderCartPage(template, view);
  response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  response.end(html);
};

/** Answer one request for the cart page. */
const handleRequest = async (
  request: IncomingMessage,
  response: ServerResponse,
): Promise<void> => {
  const url: URL = new URL(request.url ?? "/", `http://${CART_PAGE_HOST}`);

  if (request.method === "GET" && url.pathname === "/favicon.ico") {
    response.writeHead(204);
    response.end();
    return;
  }

  if (request.method === "GET" && url.pathname === "/") {
    sendPage(response, toCartPageView(pageState, "", ""));
    return;
  }

  if (request.method === "POST" && url.pathname === "/add") {
    const body: string = await readBody(request);
    const fields: URLSearchParams = new URLSearchParams(body);
    const rawName: string = fields.get("name") ?? "";
    const rawPrice: string = fields.get("price") ?? "";
    pageState = submitCartItem(pageState, rawName, rawPrice);
    const keepInput: boolean = pageState.notice.length > 0;
    sendPage(
      response,
      toCartPageView(
        pageState,
        keepInput ? rawName : "",
        keepInput ? rawPrice : "",
      ),
    );
    return;
  }

  response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
  response.end("Not found");
};

/** Serve the cart page on the local port. */
export const startCartPage = (): void => {
  const server = createServer((request: IncomingMessage, response: ServerResponse): void => {
    handleRequest(request, response).catch((error: unknown): void => {
      const message: string = error instanceof Error ? error.message : "Request failed.";
      response.writeHead(400, { "content-type": "text/plain; charset=utf-8" });
      response.end(message);
    });
  });

  server.listen(CART_PAGE_PORT, CART_PAGE_HOST, (): void => {
    console.log(`Cart page at http://${CART_PAGE_HOST}:${CART_PAGE_PORT}`);
  });
};

const isDirectRun: boolean =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  startCartPage();
}
