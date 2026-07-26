import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ['income', 'expense', 'both'], required: true },
    isCustom: { type: Boolean, default: false },
    icon: { type: String, default: 'Circle' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: function() { return this.isCustom; } },
  },
  { timestamps: true }
);

export default mongoose.model('Category', categorySchema);
