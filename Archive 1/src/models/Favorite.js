import mongoose from 'mongoose'

const favoriteSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  carId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// Ensure unique combination of userId and carId
favoriteSchema.index({ userId: 1, carId: 1 }, { unique: true })

export default mongoose.models.Favorite || mongoose.model('Favorite', favoriteSchema) 