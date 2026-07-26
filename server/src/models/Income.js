import mongoose from 'mongoose';

const incomeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, required: true }, // E.g., Salary, Freelance
    date: { type: Date, required: true },
    time: { type: String, required: true },
    channel: { type: String, enum: ['Bank', 'Cash', 'Bkash', 'Rocket', 'Nagad', 'Upay', 'Card', 'Virtual Card'], required: true },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Income', incomeSchema);
