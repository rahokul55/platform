import express from "express";
import { createServer as createViteServer } from "vite";
import { createServer } from "http";
import { Server } from "socket.io";

async function startServer() {
  const app = express();
  const PORT = 3000;
  const httpServer = createServer(app);
  
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Nexus Server is running!" });
  });

  io.on("connection", (socket) => {
    console.log("New user connected:", socket.id);

    socket.on("join-room", (roomId, userName) => {
      console.log(`User ${userName} (${socket.id}) joined room ${roomId}`);
      socket.join(roomId);
      
      socket.to(roomId).emit("user-connected", { userId: socket.id, userName });

      socket.on("offer", (payload) => {
        io.to(payload.userToSignal).emit("offer", {
          signal: payload.signal,
          callerID: payload.callerID,
          callerName: payload.callerName
        });
      });

      socket.on("answer", (payload) => {
        io.to(payload.callerID).emit("answer", {
          signal: payload.signal,
          id: socket.id
        });
      });

      socket.on("ice-candidate", (payload) => {
        io.to(payload.target).emit("ice-candidate", {
          candidate: payload.candidate,
          id: socket.id
        });
      });

      socket.on("disconnect", () => {
        console.log(`User ${socket.id} disconnected`);
        socket.to(roomId).emit("user-disconnected", socket.id);
      });
    });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
