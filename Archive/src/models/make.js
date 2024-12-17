import mongoose from "mongoose";

const makeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  logo: {
    type: String,
    default: ""
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const Make = mongoose.models.Make || mongoose.model("Make", makeSchema);
export default Make; 