// import http from "http";
const http = require("http");
const handler = require("serve-handler");
// import handler from "serve-handler";
// import path from "path";

const port = Number(process.env.PORT) || 3000;
const dir = process.env.STATIC_DIR || process.cwd();

const server = http.createServer((req: any, res: any) => {
  return handler(req, res, {
    public: dir,
    rewrites: [{ source: "**", destination: "/index.html" }], // SPA mode
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Serving ${dir} at http://localhost:${port}`);
});
