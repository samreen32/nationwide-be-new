const connectToMongo = require("./db");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

// const Parse = require('parse/node');
// Parse.initialize("62d0TWpBbBq0GuNVOiND0ud5DDlkVBHtLSutjIgV", "q0gU9474SnvzPf41nhR6p7a9i0gftg3G62CyEk1N");
// Parse.serverURL = 'https://parseapi.back4app.com';


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
