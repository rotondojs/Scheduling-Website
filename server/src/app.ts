/* eslint no-console: "off" */

import express, { Router } from "express";
import { Server } from "socket.io";
import * as http from "node:http";
import * as user from "./controllers/user.controller.ts";
import * as session from "./controllers/session.controller.ts";
import * as stats from "./controllers/stats.controller.ts";
import * as group from "./controllers/group.controller.ts";
import * as friend from "./controllers/friend.controller.ts";

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
        .get("/search", user.searchUsers)
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
    )
    .use(
      "/stats",
      express.Router()
        .get("/fortnite", stats.getFortniteStats)
        .get("/steam", stats.getSteamStats)
        .get("/apex", stats.getApexStats),
    )
    .use(
      "/friend",
      express.Router()
        .post("/request", friend.postSendRequest)
        .post("/respond", friend.postRespond)
        .post("/remove", friend.postRemove)
        .get("/list", friend.getFriends)
        .get("/inbox", friend.getInbox),
    )
    .use(
      "/group",
      express.Router()
        .post("/create", group.postCreate)
        .get("/list", group.getList)
        .get("/:id/messages", group.getMessages)
        .post("/:id/message", group.postMessage),
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

  socket.on("groupWatch", (groupId: string) => {
    socket.join(`group:${groupId}`);
  });

  socket.on("groupUnwatch", (groupId: string) => {
    socket.leave(`group:${groupId}`);
  });

  socket.on("userWatch", (userId: string) => {
    socket.join(`user:${userId}`);
  });

  socket.on("userUnwatch", (userId: string) => {
    socket.leave(`user:${userId}`);
  });

  socket.on("disconnect", () => {
    console.log(`Disconnected: ${socket.id}`);
  });
});
