const mongoose = require("mongoose");

const LoanSchema = new mongoose.Schema(
  {
    lenderId: { type: String, required: true },

    lenderName: String,
    lenderEmail: String,

    debtorName: String,
    debtorEmail: String,

    amount: Number,
    dueDate: String,

    interestEnabled: Boolean,
    interestPercent: Number,

    paymentMode: String,
    installments: Number,
    installmentAmount: Number,

    totalToPay: Number,
    remainingAmount: Number,

    payments: [
      {
        amount: Number,
        date: Date,
      }
    ],

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "paid"],
      default: "pending",
    },

    code: { type: String, unique: true, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Loan", LoanSchema);
