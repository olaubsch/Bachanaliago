require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const socketIo = require("socket.io");

const userRoutes = require("./routes/userRoutes");
const groupRoutes = require("./routes/groupRoutes");
const taskRoutes = require("./routes/taskRoutes");
const submissionRoutes = require('./routes/submissionRoutes');

const app = express();
const server = http.createServer(app);

// --- SOCKET.IO SETUP ---
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "DELETE"],
    }
});

app.set("io", io);

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/tasks", taskRoutes);
app.use('/api/submissions', submissionRoutes);

io.on("connection", (socket) => {
    console.log("New client connected");

    socket.on("joinGroup", (groupCode) => {
        socket.join(groupCode); // join socket room
    });

    socket.on("userJoined", (groupCode) => {
        socket.to(groupCode).emit("refreshData");
    });

    socket.on("userRemoved", ({ groupCode, userId }) => {
        io.to(groupCode).emit("userRemoved", { groupCode, userId });
    });

    socket.on("userQuit", ({ groupCode }) => {
        io.to(groupCode).emit("refreshData");
    });

    socket.on("groupDeleted", ({ groupCode }) => {
        io.to(groupCode).emit("forceLogout");
    });

    socket.on("ownershipTransferred", ({ groupCode, newOwnerId }) => {
        io.to(groupCode).emit("ownershipTransferred", { groupCode, newOwnerId });
    });

});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
      server.listen(5000, () =>
        console.log("Server + Socket.IO running on http://localhost:5000")
    );
  })
  .catch((err) => console.error(err));
