/* eslint no-console: "off" */

import express, { Router } from "express";
import { Server } from "socket.io";
import * as http from "node:http";
import * as user from "./controllers/user.controller.ts";
import * as session from "./controllers/session.controller.ts";

export const app = express();
export const httpServer = http.createServer(app);
export const io = new Server(httpServer);

app.use(express.json());

app.use(
  "/api",
  Router()
    .use(
      "/user",
      express.Router()
        .post("/signup", user.postSignup)
        .post("/login", user.postLogin)
        .get("/:username", user.getByUsername),
    )
    .use(
      "/session",
      express.Router()
        .post("/create", session.postCreate)
        .get("/list", session.getList)
        .get("/user/:userId", session.getUserSessions)
        .get("/:id", session.getById)
        .post("/:id/join", session.postJoin)
        .post("/:id/leave", session.postLeave),
    ),
);

io.on("connection", (socket) => {
  console.log(`Connected: ${socket.id}`);

  socket.on("sessionWatch", (sessionId: string) => {
    socket.join(`session:${sessionId}`);
  });

  socket.on("sessionUnwatch", (sessionId: string) => {
    socket.leave(`session:${sessionId}`);
  });

  socket.on("disconnect", () => {
    console.log(`Disconnected: ${socket.id}`);
  });
});
