import mongoose from 'mongoose';

const savingsHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    savingsAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'Savings', required: true },
    type: { type: String, enum: ['Deposit', 'Withdraw'], required: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('SavingsHistory', savingsHistorySchema);
