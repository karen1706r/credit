const Loan = require("../models/Loan");
const User = require("../models/User");

// ================================
// Generar código único
// ================================
function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// ================================
// Crear préstamo
// ================================
exports.createLoan = async (req, res) => {
  try {
    const {
      lenderId,
      debtorEmail,
      amount,
      dueDate,
      interestEnabled,
      interestPercent,
      paymentMode,
      installments,
    } = req.body;

    // Buscar prestamista
    const lenderUser = await User.findById(lenderId);
    if (!lenderUser) {
      return res.status(404).json({ error: "Prestamista no encontrado" });
    }

    // Buscar deudor
    const debtorUser = await User.findOne({ email: debtorEmail });
    if (!debtorUser) {
      return res.status(404).json({ error: "Deudor no encontrado" });
    }

    // Calcular total a pagar
    let totalToPay = amount;
    if (interestEnabled && interestPercent > 0) {
      totalToPay = amount + (amount * interestPercent) / 100;
    }

    // Calcular cuotas
    let installmentAmount = null;
    if (paymentMode === "cuotas" && installments > 0) {
      installmentAmount = parseFloat((totalToPay / installments).toFixed(2));
    }

    // Generar código único
    function generateCode() {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let code = "";
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    }
    let code = generateCode();
    while (await Loan.findOne({ code })) code = generateCode();

    // Crear préstamo
    const newLoan = await Loan.create({
      lenderId,

      lenderName: lenderUser.name,
      lenderEmail: lenderUser.email,

      debtorName: debtorUser.name,
      debtorEmail: debtorUser.email,

      amount,
      dueDate,
      interestEnabled,
      interestPercent,
      paymentMode,
      installments,
      installmentAmount,
      totalToPay,

      remainingAmount: totalToPay,
      payments: [],
      status: "pending",
      code,
    });

    res.status(201).json({ msg: "Préstamo creado", loan: newLoan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ================================
// Buscar por código
// ================================
exports.getLoanByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const loan = await Loan.findOne({ code });

    if (!loan) return res.status(404).json({ msg: "Préstamo no encontrado" });

    res.json({ loan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================================
// Aceptar préstamo
// ================================
exports.acceptLoan = async (req, res) => {
  try {
    const { code } = req.params;
    const loan = await Loan.findOne({ code });

    if (!loan) return res.status(404).json({ msg: "Préstamo no encontrado" });

    loan.status = "accepted";
    await loan.save();

    res.json({ msg: "Préstamo aceptado", loan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================================
// Rechazar préstamo → eliminar
// ================================
exports.rejectLoan = async (req, res) => {
  try {
    const { code } = req.params;

    const deleted = await Loan.findOneAndDelete({ code });
    if (!deleted)
      return res.status(404).json({ error: "Préstamo no encontrado" });

    res.json({ msg: "Préstamo rechazado y eliminado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================================
// Préstamos donde soy prestamista
// ================================
exports.getLoansByLender = async (req, res) => {
  try {
    const { lenderId } = req.params;

    const loans = await Loan.find({ lenderId }).sort({ createdAt: -1 });

    res.json({ loans });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================================
// Préstamos donde soy deudor
// ================================
exports.getLoansByDebtor = async (req, res) => {
  try {
    const { email } = req.params;

    const loans = await Loan.find({ debtorEmail: email }).sort({
      createdAt: -1,
    });

    res.json({ loans });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================================
// Marcar como pagado
// ================================
exports.markLoanPaid = async (req, res) => {
  try {
    const { code } = req.params;

    const loan = await Loan.findOne({ code });
    if (!loan) return res.status(404).json({ msg: "Préstamo no encontrado" });

    loan.status = "paid";
    await loan.save();

    res.json({ msg: "Préstamo marcado como pagado", loan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================================
// Agregar abono
// ================================
exports.addPayment = async (req, res) => {
  try {
    const { code } = req.params;
    const { amount } = req.body;

    const loan = await Loan.findOne({ code });

    if (!loan) return res.status(404).json({ msg: "Préstamo no encontrado" });

    if (loan.status === "paid")
      return res.status(400).json({ msg: "El préstamo ya está pagado" });

    // Agregar pago
    loan.payments.push({
      amount,
      date: new Date(),
    });

    // Actualizar deuda
    loan.remainingAmount -= amount;

    if (loan.remainingAmount <= 0) {
      loan.remainingAmount = 0;
      loan.status = "paid";
    }

    await loan.save();

    res.json({ msg: "Pago agregado", loan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
