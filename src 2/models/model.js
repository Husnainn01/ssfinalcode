import mongoose from "mongoose";

const modelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  make: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Make',
    required: true
  },
  image: {
    type: String,
    default: ""
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const Model = mongoose.models.Model || mongoose.model("Model", modelSchema);
export default Model; 