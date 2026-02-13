const WebSocket = require("ws");
const http = require("http");
const { setupWSConnection } = require("y-websocket/bin/utils");

const PORT = process.env.PORT || 1234;
const HOST = process.env.HOST || "0.0.0.0";

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Yjs WebSocket server running");
});

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws, req) => {
  setupWSConnection(ws, req);
});

server.listen(PORT, HOST, () => {
  console.log(`Yjs WebSocket server running on ${HOST}:${PORT}`);
});
