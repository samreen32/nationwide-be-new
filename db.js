const mongoose = require("mongoose");
const mongoURI =
  "mongodb://iamsamreenk:oEVqrZ8bwH3JzMs2@cluster0-shard-00-00.jxybe.mongodb.net:27017,cluster0-shard-00-01.jxybe.mongodb.net:27017,cluster0-shard-00-02.jxybe.mongodb.net:27017/?ssl=true&replicaSet=atlas-3mfhd3-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0"
// "mongodb://localhost:27017";


  // "mongodb+srv://iamsamreenk:oEVqrZ8bwH3JzMs2@cluster0.jxybe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
// "mongodb+srv://iamsamreenk:oEVqrZ8bwH3JzMs2@cluster0.jxybe.mongodb.net/";

const connectToMongo = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("Connected To Mongoose Successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
  }
};

module.exports = connectToMongo;