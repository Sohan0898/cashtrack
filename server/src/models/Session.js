import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ipAddress: { type: String, required: true },
    device: { type: String, required: true },
    lastActive: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Auto-delete after 30 days based on lastActive
sessionSchema.index({ lastActive: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export default mongoose.model('Session', sessionSchema);
