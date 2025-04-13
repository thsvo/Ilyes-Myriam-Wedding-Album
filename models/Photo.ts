import mongoose from 'mongoose';

const PhotoSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  url: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true,
    enum: ['section1', 'section2']
  },
  // Additional ImgBB fields
  display_url: String,
  delete_url: String,
  thumbnail: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Check if the model is already defined to prevent overwriting during hot reloads
const Photo = mongoose.models.Photo || mongoose.model('Photo', PhotoSchema);

export default Photo;