const express = require('express');
const router = express.Router();
const Deposit = require('../models/Deposit');
const authMiddleware = require("../middlewares/authMiddleware");

router.post('/', authMiddleware([1,2,3]), async (req, res) => {
    try {
        const newDeposit = new Deposit(req.body);
        const savedDeposit = await newDeposit.save();

        const populatedDeposit = await Deposit.findById(savedDeposit._id)
            .populate('vehicleId')
            .populate('typeReparationIds')
            .populate('clientId');
        
        res.status(201).json(populatedDeposit);
    } catch (error) {
        res.status(500).json({ message: 'Error creating deposit', error: error.message });
    }
});

router.get('/', authMiddleware([1,2,3]), async (req, res) => {
    try {
        const deposits = await Deposit.find()
            .populate('vehicleId')
            .populate('typeReparationIds')
            .populate('clientId');
        res.status(200).json(deposits);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching deposits', error: error.message });
    }
});

router.get('/:id', authMiddleware([1,2,3]), async (req, res) => {
    try {
        const deposit = await Deposit.findById(req.params.id)
            .populate('vehicleId')
            .populate('typeReparationIds')
            .populate('clientId');
        
        if (!deposit) {
            return res.status(404).json({ message: 'Deposit not found' });
        }
        res.status(200).json(deposit);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching deposit', error: error.message });
    }
});

router.put('/:id', authMiddleware([1,2,3]), async (req, res) => {
    try {
        const updatedDeposit = await Deposit.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('vehicleId')
         .populate('typeReparationIds')
         .populate('clientId');
        
        if (!updatedDeposit) {
            return res.status(404).json({ message: 'Deposit not found' });
        }
        res.status(200).json(updatedDeposit);
    } catch (error) {
        res.status(500).json({ message: 'Error updating deposit', error: error.message });
    }
});

router.delete('/:id', authMiddleware([1,2,3]), async (req, res) => {
    try {
        const deletedDeposit = await Deposit.findByIdAndDelete(req.params.id);
        if (!deletedDeposit) {
            return res.status(404).json({ message: 'Deposit not found' });
        }
        res.status(200).json({ message: 'Deposit deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting deposit', error: error.message });
    }
});


router.get('/client/:clientId', authMiddleware([1,2,3]), async (req, res) => {
    try {
        const deposits = await Deposit.find({ clientId: req.params.clientId })
            .populate('vehicleId')
            .populate('typeReparationIds')
            .populate('clientId');

        res.status(200).json(deposits);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching deposits by clientId', error: error.message });
    }
});

module.exports = router;