const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense'); // Modèle Expense
const authMiddleware = require("../middlewares/authMiddleware");

router.post('/', authMiddleware([3]), async (req, res) => {
    try {
        const newExpense = new Expense(req.body);
        const savedExpense = await newExpense.save();
        res.status(201).json(savedExpense);
    } catch (error) {
        res.status(500).json({ message: 'Error creating expense', error: error.message });
    }
});

router.get('/', authMiddleware([1, 2, 3]), async (req, res) => {
    try {
        const expenses = await Expense.find();
        res.status(200).json(expenses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching expenses', error: error.message });
    }
});

router.put('/:id', authMiddleware([3]), async (req, res) => {
    try {
        const updatedExpense = await Expense.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedExpense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        res.status(200).json(updatedExpense);
    } catch (error) {
        res.status(500).json({ message: 'Error updating expense', error: error.message });
    }
});

router.delete('/:id', authMiddleware([3]), async (req, res) => {
    try {
        const deletedExpense = await Expense.findByIdAndDelete(req.params.id);
        if (!deletedExpense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting expense', error: error.message });
    }
});

module.exports = router;