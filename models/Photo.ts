import mongoose from 'mongoose';

const PhotoSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true,
    enum: ['section1', 'section2']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Photo || mongoose.model('Photo', PhotoSchema);