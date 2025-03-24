const express = require('express');
const router = express.Router();
const Reparation = require('../models/Reparation');
const authMiddleware = require("../middlewares/authMiddleware");

router.post('/', authMiddleware([3]), async (req, res) => {
    try {
        const newType = new Reparation(req.body);
        const savedType = await newType.save();
        res.status(201).json(savedType);
    } catch (error) {
        res.status(500).json({ message: 'Error creating reparation type', error: error.message });
    }
});

router.get('/', authMiddleware([1,2,3]), async (req, res) => {
    try {
        const types = await Reparation.find();
        res.status(200).json(types);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reparation type', error: error.message });
    }
});

router.put('/:id', authMiddleware([3]), async (req, res) => {
    try {
        const updatedType = await Reparation.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedType) {
            return res.status(404).json({ message: 'Reparation type not found' });
        }
        res.status(200).json(updatedType);
    } catch (error) {
        res.status(500).json({ message: 'Error updating reparation type', error: error.message });
    }
});

router.delete('/:id', authMiddleware([3]), async (req, res) => {
    try {
        const deletedType = await Reparation.findByIdAndDelete(req.params.id);
        if (!deletedType) {
            return res.status(404).json({ message: 'Reparation type not found' });
        }
        res.status(200).json({ message: 'Reparation type deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting reparation type', error: error.message });
    }
});

module.exports = router;
