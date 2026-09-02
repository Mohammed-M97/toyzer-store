// Minimal RESP server: just enough of the protocol for ioredis to connect and
// for GET/SET/DEL to round-trip. Records every command it receives.
import net from "net";

export const commands = [];
const store = new Map();

const parse = (buf) => {
  const parts = buf.toString().split("\r\n");
  const out = [];
  let i = 0;
  while (i < parts.length) {
    if (parts[i].startsWith("*")) {
      const n = parseInt(parts[i].slice(1), 10);
      const args = [];
      i++;
      for (let k = 0; k < n; k++) { i++; args.push(parts[i]); i++; }
      out.push(args);
    } else i++;
  }
  return out;
};

export const start = (port) =>
  new Promise((resolve) => {
    const server = net.createServer((socket) => {
      socket.on("data", (buf) => {
        for (const args of parse(buf)) {
          if (!args.length) continue;
          const cmd = String(args[0]).toUpperCase();
          commands.push(args.join(" "));

          if (cmd === "PING") socket.write("+PONG\r\n");
          else if (cmd === "INFO") {
            const info = "# Server\r\nredis_version:7.0.0\r\n# Persistence\r\nloading:0\r\n";
            socket.write(`$${Buffer.byteLength(info)}\r\n${info}\r\n`);
          } else if (cmd === "SET") { store.set(args[1], args[2]); socket.write("+OK\r\n"); }
          else if (cmd === "GET") {
            const v = store.get(args[1]);
            socket.write(v === undefined ? "$-1\r\n" : `$${Buffer.byteLength(v)}\r\n${v}\r\n`);
          } else if (cmd === "DEL") { socket.write(`:${store.delete(args[1]) ? 1 : 0}\r\n`); }
          else socket.write("+OK\r\n");
        }
      });
      socket.on("error", () => {});
    });
    server.listen(port, "127.0.0.1", () => resolve(server));
  });

export const upper = () => commands.map((c) => c.toUpperCase());
export const seed = (k, v) => store.set(k, v);
export const has = (k) => store.has(k);
