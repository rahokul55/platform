import express from "express";
import { createServer as createViteServer } from "vite";
import { createServer } from "http";
import { Server } from "socket.io";

async function startServer() {
  const app = express();
  const PORT = 3000;
  const httpServer = createServer(app);
  
  // Socket.io for WebRTC Signaling
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Nexus Server is running!" });
  });

  // Basic Signaling Logic for WebRTC
  io.on("connection", (socket) => {
    console.log("New user connected:", socket.id);

    socket.on("join-room", (roomId, userId) => {
      console.log(`User ${userId} joined room ${roomId}`);
      socket.join(roomId);
      
      // Notify others in the room
      socket.to(roomId).emit("user-connected", userId);

      // Handle signaling messages (offer, answer, ice-candidate)
      socket.on("signal", (data) => {
        io.to(data.to).emit("signal", {
          from: socket.id,
          signal: data.signal
        });
      });

      socket.on("disconnect", () => {
        console.log(`User ${userId} disconnected`);
        socket.to(roomId).emit("user-disconnected", userId);
      });
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve the built frontend files
    app.use(express.static("dist"));
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
