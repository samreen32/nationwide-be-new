const mongoose = require("mongoose");
const { Schema } = mongoose;

const repairSchema = new Schema({
  user_list: {
    firstname: { type: String, required: false, default: null },
    lastname: { type: String, required: false, default: null },
    phone: { type: String, required: false, default: null },
    email: { type: String, required: false, default: null },
    address: { type: String, required: false, default: null },
    city: { type: String, required: false, default: null },
    state: { type: String, required: false, default: null },
    zip: { type: String, required: false, default: null },
  },
  form_list: {
    model: { type: String, required: false, default: null },
    serialNum: { type: String, required: false, default: null },
    modelImage: { type: String, required: false, default: null },
    description: { 
      type: String, 
      required: false,
      default: "No description provided by customer",
      set: function(desc) {
        return desc && desc.trim() !== '' ? desc : "No description provided by customer";
      }
    },
  },
  workOrderNumber: { 
    type: String, 
    required: false, 
    unique: true, 
    sparse: true 
  },
  date: {
    type: Date,
    required: false,
    default: Date.now,
  },
  status: {
    type: String,
    required: false,
    enum: ["pending", "received", "ship", "completed"],
    default: "pending",
  },
}, {
  strict: false 
});
const Repair = mongoose.model("repairForm", repairSchema);
module.exports = Repair;