require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const socketIo = require("socket.io");
const fs = require("fs");
const fsPromises = fs.promises;
const path = require("path");
const TaskSubmission = require("./models/TaskSubmission");
const bannedWordsRoutes = require("./routes/bannedWordsRoutes");
const userRoutes = require("./routes/userRoutes");
const groupRoutes = require("./routes/groupRoutes");
const taskRoutes = require("./routes/taskRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const User = require("./models/User");
const Group = require("./models/Group");
const Task = require("./models/Task");
const Setting = require("./models/Setting");

const app = express();
const server = http.createServer(app);
app.use(express.json());

// Middleware to check if the app is enabled
const checkAppEnabled = async (req, res, next) => {
  const appEnabled = await Setting.findOne({ key: "appEnabled" });
  if (appEnabled && appEnabled.value === false) {
    return res.status(403).json({ error: "App is disabled" });
  }
  next();
};

// Apply middleware to user-facing routes
app.use("/api/users", checkAppEnabled, userRoutes);
app.use("/api/groups", checkAppEnabled, groupRoutes);
app.use("/api/tasks", checkAppEnabled, taskRoutes);
app.use("/api/submissions", checkAppEnabled, submissionRoutes);

app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    return res.sendStatus(200);
  }
  return res.sendStatus(401);
});

// Killswitch endpoint
app.post("/api/admin/killswitch", async (req, res) => {
  const { password } = req.body;
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Invalid password" });
  }
  try {
    await User.deleteMany({});
    await Group.deleteMany({});
    await Task.deleteMany({});
    await TaskSubmission.deleteMany({});
    await Setting.updateOne(
      { key: "appEnabled" },
      { value: false },
      { upsert: true }
    );
    res.json({ message: "Database deleted and app disabled" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error performing killswitch" });
  }
});

// Enable app endpoint
app.post("/api/admin/enableApp", async (req, res) => {
  const { password } = req.body;
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Invalid password" });
  }
  try {
    await Setting.updateOne(
      { key: "appEnabled" },
      { value: true },
      { upsert: true }
    );
    res.json({ message: "App enabled" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error enabling app" });
  }
});

// Disable app endpoint
app.post("/api/admin/disableApp", async (req, res) => {
  const { password } = req.body;
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Invalid password" });
  }
  try {
    await Setting.updateOne(
      { key: "appEnabled" },
      { value: false },
      { upsert: true }
    );
    res.json({ message: "App disabled" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error disabling app" });
  }
});

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/bannedWords", bannedWordsRoutes);

const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "DELETE"],
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("New client connected ID:", socket.id);

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

  socket.on("getImage", async (data) => {
    const { submissionId } = data;
    try {
      const submission = await TaskSubmission.findById(submissionId);
      if (
        !submission ||
        (submission.type !== "photo" && submission.type !== "video")
      ) {
        socket.emit("imageError", {
          submissionId,
          error: "Invalid submission",
        });
        return;
      }

      const filePath = path.join(__dirname, submission.submissionData);
      const fileData = await fsPromises.readFile(filePath);
      const mimeType = submission.type === "photo" ? "image/jpeg" : "video/mp4"; // Adjust MIME type as needed
      const dataUrl = `data:${mimeType};base64,${fileData.toString("base64")}`;

      socket.emit("imageData", { submissionId, dataUrl });
    } catch (err) {
      console.error(err);
      socket.emit("imageError", {
        submissionId,
        error: "File not found or server error",
      });
    }
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    // Ensure the uploads folder exists
    const uploadDir = "uploads";
    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
        console.log("Uploads folder created");
      } else {
        console.log("Uploads folder already exists");
      }
    } catch (err) {
      console.error("Error creating uploads folder:", err);
    }

    server.listen(5000, () =>
      console.log("Server + Socket.IO running on http://localhost:5000")
    );
  })
  .catch((err) => console.error(err));