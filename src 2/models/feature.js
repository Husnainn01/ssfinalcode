import mongoose from "mongoose";

const featureSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    enum: ['comfort', 'safety', 'performance', 'other'],
    default: 'other'
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const Feature = mongoose.models.Feature || mongoose.model("Feature", featureSchema);
export default Feature; 