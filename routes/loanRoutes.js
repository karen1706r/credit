const express = require("express");
const router = express.Router();

const {
  createLoan,
  getLoanByCode,
  acceptLoan,
  rejectLoan,
  getLoansByLender,
  getLoansByDebtor,
  markLoanPaid,
  addPayment      
} = require("../controllers/loanController");

router.post("/create", createLoan);
router.get("/code/:code", getLoanByCode);
router.patch("/accept/:code", acceptLoan);
router.patch("/reject/:code", rejectLoan);

router.patch("/payment/:code", addPayment);
router.patch("/paid/:code", markLoanPaid);

router.get("/lender/:lenderId", getLoansByLender);
router.get("/debtor/:email", getLoansByDebtor);

router.patch("/paid/:code", markLoanPaid);

module.exports = router;
