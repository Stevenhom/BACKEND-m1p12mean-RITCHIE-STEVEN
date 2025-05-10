const express = require('express');
const router = express.Router();
const Brand = require('../models/Brand');
const authMiddleware = require("../middlewares/authMiddleware");

router.post('/', authMiddleware([1,2,3]), async (req, res) => {
    try {
        const newBrand = new Brand({
            brand: req.body.brand,
        });
        const savedBrand = await newBrand.save();
        res.status(201).json(savedBrand);
    } catch (error) {
        res.status(500).json({ message: 'Error creating brand', error: error.message });
    }
});

router.get('/', authMiddleware([1,2,3]), async (req, res) => {
    try {
        const brands = await Brand.find();
        res.status(200).json(brands);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching brands', error: error.message });
    }
});

router.get('/:id', authMiddleware([1,2,3]), async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if (!brand) {
            return res.status(404).json({ message: 'Brand not found' });
        }
        res.status(200).json(brand);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching brand', error: error.message });
    }
});

router.put('/:id', authMiddleware([1,2,3]), async (req, res) => {
    try {
        const updatedBrand = await Brand.findByIdAndUpdate(
            req.params.id,
            { brand: req.body.brand },
            { new: true, runValidators: true }
        );
        if (!updatedBrand) {
            return res.status(404).json({ message: 'Brand not found' });
        }
        res.status(200).json(updatedBrand);
    } catch (error) {
        res.status(500).json({ message: 'Error updating brand', error: error.message });
    }
});

router.delete('/:id', authMiddleware([1,2,3]), async (req, res) => {
    try {
        const deletedBrand = await Brand.findByIdAndDelete(req.params.id);
        if (!deletedBrand) {
            return res.status(404).json({ message: 'Brand not found' });
        }
        res.status(200).json({ message: 'Brand deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting brand', error: error.message });
    }
});

module.exports = router;