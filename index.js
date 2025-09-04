const connectToMongo = require("./db");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

connectToMongo();

const app = express();
const port = 5000;

// Handle OPTIONS requests first
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  res.status(200).send();
});

// Apply CORS middleware
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.use(express.json());

// Available Routes
app.use("/api/repair", require("./routes/repair"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/blog", require("./routes/blog"));

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
