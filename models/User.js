const mongoose = require("mongoose");
const { Schema } = mongoose;

const usersSchema = new Schema({
  nation_users: {
    firstname: { type: String },
    lastname: { type: String },
    phone: { type: String },
    email: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    zip: { type: String },
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("nationUsers", usersSchema);
module.exports = User;
