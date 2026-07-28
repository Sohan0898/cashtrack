import mongoose from 'mongoose';

const bankInterestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['Add', 'Infaq'], required: true },
    amount: { type: Number, required: true, min: 0 },
    bank: { type: String }, // Used when type is 'Add'
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('BankInterest', bankInterestSchema);
