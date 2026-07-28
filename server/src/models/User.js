import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    firebaseUid: { type: String, required: true, unique: true },
    avatar: { type: String, default: '' },
    currency: { type: String, default: 'USD' },
    language: { type: String, default: 'en' },
    theme: { type: String, default: 'light' },
    hasSeededCategories: { type: Boolean, default: false },
    lastLogin: { type: Date },
    lastLoginIp: { type: String },
    lastLoginDevice: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
