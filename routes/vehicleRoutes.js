const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const authMiddleware = require("../middlewares/authMiddleware");

router.post('/', authMiddleware([1,2,3]), async (req, res) => {
    try {
        const newVehicle = new Vehicle(req.body);
        const savedVehicle = await newVehicle.save();
        res.status(201).json(savedVehicle);
    } catch (error) {
        res.status(500).json({ message: 'Error creating vehicle', error: error.message });
    }
});

router.get('/', authMiddleware([1,2,3]), async (req, res) => {
    try {
        const vehicles = await Vehicle.find().populate('clientId').populate('brandId');;
        res.status(200).json(vehicles);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching vehicles', error: error.message });
    }
});

router.get('/:id', authMiddleware([1,2,3]), async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id).populate('clientId');
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }
        res.status(200).json(vehicle);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching vehicle', error: error.message });
    }
});

router.put('/:id', authMiddleware([1,2,3]), async (req, res) => {
    try {
        const updatedVehicle = await Vehicle.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedVehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }
        res.status(200).json(updatedVehicle);
    } catch (error) {
        res.status(500).json({ message: 'Error updating vehicle', error: error.message });
    }
});

router.delete('/:id', authMiddleware([1,2,3]), async (req, res) => {
    try {
        const deletedVehicle = await Vehicle.findByIdAndDelete(req.params.id);
        if (!deletedVehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }
        res.status(200).json({ message: 'Vehicle deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting vehicle', error: error.message });
    }
});

router.get('/client/:clientId', authMiddleware([1,2,3]), async (req, res) => {
    try {
        const vehicles = await Vehicle.find({ clientId: req.params.clientId })
            .populate('clientId')
            .populate('brandId');

        res.status(200).json(vehicles);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching vehicles by clientId', error: error.message });
    }
});

module.exports = router;