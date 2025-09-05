const connectToMongo = require("./db");
const express = require("express");
const cors = require("cors");
require("dotenv").config();


connectToMongo();

const app = express();
const port = process.env.PORT || 8080;
app.use(cors());
app.use(express.json());

// Available Routes
app.use("/api/repair", require("./routes/repair"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/blog", require("./routes/blog"));

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
