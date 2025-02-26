import mongoose from 'mongoose';

const sliderSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required'],  
  },
  public_id: {
    type: String,
    required: [true, 'Cloudinary public ID is required'],
  },
  order: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  link: {
    type: String,
  },
  description: {
    type: String,
  },
  highlight: {
    type: String,
  }
}, {
  timestamps: true
});

const Slider = mongoose.models.Slider || mongoose.model('Slider', sliderSchema);

export default Slider; 