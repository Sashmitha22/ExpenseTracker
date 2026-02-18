const Expense = require('../models/Expense');

exports.addExpense = async (req, res) => {
  try {
    const { amount, category, note, date } = req.body;

    if (!amount || !category) {
      return res.status(400).json({ message: 'Please provide amount and category' });
    }

    const expense = new Expense({
      user: req.user.id,
      amount,
      category,
      note,
      date: date || new Date()
    });

    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, startDate, endDate, search } = req.query;
    
    const query = { user: req.user.id };

    if (category) {
      query.category = category;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (search) {
      query.note = { $regex: search, $options: 'i' };
    }

    const expenses = await Expense.find(query)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Expense.countDocuments(query);

    res.json({
      expenses,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user.id });
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    expense.amount = req.body.amount || expense.amount;
    expense.category = req.body.category || expense.category;
    expense.note = req.body.note !== undefined ? req.body.note : expense.note;
    expense.date = req.body.date || expense.date;

    await expense.save();
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMonthlySummary = async (req, res) => {
  try {
    const { year, month } = req.query;
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const expenses = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $dayOfMonth: '$date' },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const total = expenses.reduce((sum, day) => sum + day.total, 0);

    res.json({ expenses, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCategoryStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = { user: req.user._id };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const stats = await Expense.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      },
      { $sort: { total: -1 } }
    ]);

    const total = stats.reduce((sum, cat) => sum + cat.total, 0);

    res.json({ stats, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTotalExpense = async (req, res) => {
  try {
    const result = await Expense.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({ total: result[0]?.total || 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.exportToCSV = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });
    
    const csv = [
      ['Date', 'Category', 'Amount', 'Note'].join(','),
      ...expenses.map(e => [
        new Date(e.date).toLocaleDateString(),
        e.category,
        e.amount,
        `"${e.note || ''}"`
      ].join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=expenses.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
