// backend/server.js
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.IO
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "https://realtime-chat-app-node-react-socket.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (use database in production)
let messages = [];
let onlineUsers = new Map(); // socketId -> { username, joinTime }

// Utility functions
const getCurrentTimestamp = () => new Date().toISOString();

const broadcastOnlineUsers = () => {
  const userList = Array.from(onlineUsers.values()).map(user => ({
    username: user.username,
    joinTime: user.joinTime
  }));
  io.emit("online_users", userList);
};

const addSystemMessage = (content, type = "info") => {
  const systemMessage = {
    id: Date.now() + Math.random(),
    message: content,
    username: "System",
    timestamp: getCurrentTimestamp(),
    type: type,
    isSystem: true
  };
  messages.push(systemMessage);
  return systemMessage;
};

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`🔗 User connected: ${socket.id}`);
  
  // Send chat history to new user
  socket.emit("chat_history", messages);
  
  // Handle user joining
  socket.on("user_joined", (username) => {
    console.log(`👋 ${username} joined the chat`);
    
    // Store user info
    onlineUsers.set(socket.id, {
      username: username,
      joinTime: getCurrentTimestamp()
    });
    
    // Create and broadcast join message
    const joinMessage = addSystemMessage(`${username} joined the chat`, "join");
    io.emit("receive_message", joinMessage);
    
    // Broadcast updated user list
    broadcastOnlineUsers();
  });
  
  // Handle message sending
  socket.on("send_message", (data) => {
    const user = onlineUsers.get(socket.id);
    
    if (!user) {
      socket.emit("error", "User not found. Please refresh and rejoin.");
      return;
    }
    
    // Validate message
    if (!data.message || !data.message.trim()) {
      return;
    }
    
    // Create message object
    const messageData = {
      id: data.id || Date.now() + Math.random(),
      message: data.message.trim(),
      username: user.username,
      timestamp: getCurrentTimestamp(),
      type: "message"
    };
    
    // Store message
    messages.push(messageData);
    
    // Limit message history (keep last 100 messages)
    if (messages.length > 100) {
      messages = messages.slice(-100);
    }
    
    console.log(`💬 [${user.username}]: ${messageData.message}`);
    
    // Broadcast message to all clients
    io.emit("receive_message", messageData);
  });
  
  // Handle typing indicators
  socket.on("user_typing", (username) => {
    const user = onlineUsers.get(socket.id);
    if (user && user.username === username) {
      socket.broadcast.emit("user_typing", username);
    }
  });
  
  socket.on("stop_typing", () => {
    socket.broadcast.emit("stop_typing");
  });
  
  // Handle disconnection
  socket.on("disconnect", () => {
    const user = onlineUsers.get(socket.id);
    
    if (user) {
      console.log(`👋 ${user.username} left the chat`);
      
      // Create and broadcast leave message
      const leaveMessage = addSystemMessage(`${user.username} left the chat`, "leave");
      socket.broadcast.emit("receive_message", leaveMessage);
      
      // Remove user from online list
      onlineUsers.delete(socket.id);
      
      // Broadcast updated user list
      broadcastOnlineUsers();
    }
    
    console.log(`🔌 User disconnected: ${socket.id}`);
  });
  
  // Handle errors
  socket.on("error", (error) => {
    console.error(`❌ Socket error for ${socket.id}:`, error);
  });
});

// REST API endpoints (optional)
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Real-time Chat Server is running!",
    version: "2.0.0",
    endpoints: {
      "/health": "Health check endpoint",
      "/stats": "Chat statistics",
      "/messages": "Get recent messages"
    }
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: getCurrentTimestamp(),
    activeConnections: io.engine.clientsCount,
    onlineUsers: onlineUsers.size,
    totalMessages: messages.length
  });
});

app.get("/stats", (req, res) => {
  const userList = Array.from(onlineUsers.values());
  
  res.json({
    totalMessages: messages.length,
    onlineUsers: onlineUsers.size,
    users: userList,
    serverUptime: process.uptime(),
    memoryUsage: process.memoryUsage()
  });
});

app.get("/messages", (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const recentMessages = messages.slice(-limit);
  
  res.json({
    messages: recentMessages,
    total: messages.length,
    limit: limit
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err);
  res.status(500).json({ 
    error: "Internal server error",
    message: err.message 
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed.');
    process.exit(0);
  });
});

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`✅ Server listening on http://localhost:${PORT}`);
});
