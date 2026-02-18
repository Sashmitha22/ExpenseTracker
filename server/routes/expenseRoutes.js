const express = require('express');
const router = express.Router();
const { 
  addExpense, 
  getExpenses, 
  updateExpense, 
  deleteExpense,
  getMonthlySummary,
  getCategoryStats,
  getTotalExpense,
  exportToCSV
} = require('../controllers/expenseController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.post('/', addExpense);
router.get('/', getExpenses);
router.get('/export', exportToCSV);
router.get('/total', getTotalExpense);
router.get('/monthly', getMonthlySummary);
router.get('/category', getCategoryStats);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;
