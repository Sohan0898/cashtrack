import mongoose from 'mongoose';

const savingsSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    accountName: { type: String, required: true }, // e.g., Emergency Fund
    balance: { type: Number, required: true, default: 0 },
    goal: { type: Number, default: null },
    type: { type: String, enum: ['Bank', 'Cash', 'Bkash', 'Nagad', 'Card', 'Matir Bank'], required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Savings', savingsSchema);
