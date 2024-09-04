import http from "http";
import { WebSocketServer } from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listing on http://localhost:3000`);

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

function handleConnection(socket) {
  console.log(socket);
}

wss.on("connection", handleConnection);

server.listen(3000, handleListen);
