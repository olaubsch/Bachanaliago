require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const userRoutes = require("./routes/userRoutes");
const groupRoutes = require("./routes/groupRoutes");
const taskRoutes = require("./routes/taskRoutes");
const submissionRoutes = require('./routes/submissionRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/tasks", taskRoutes);
app.use('/api/submissions', submissionRoutes);

app.use('/uploads', express.static('uploads'));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(5000, () =>
      console.log("Server running on http://localhost:5000")
    );
  })
  .catch((err) => console.error(err));
