const express = require('express');
const router = express.Router();
const Fleet = require('../models/Fleet');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware([1, 2, 3]), async (req, res) => {
    try {
        const fleets = await Fleet.find()
            .populate({
                path: 'reparationId',
                populate: {
                    path: 'depositId',
                    populate: {
                        path: 'vehicleId',
                        populate: {
                            path: 'clientId',
                            select: 'firstName lastName',
                        },
                    },
                },
            });

        res.status(200).json(fleets);
    } catch (error) {
        console.error(`Error fetching fleets: ${error.message}`);
        res.status(500).json({ message: 'Server error while fetching fleets', error: error.message });
    }
});

router.get('/available', authMiddleware([1, 2, 3]), async (req, res) => {
    try {
        const availableFleets = await Fleet.find({ reparationId: null })
            .populate({
                path: 'reparationId',
                populate: {
                    path: 'depositId',
                    populate: {
                        path: 'vehicleId',
                        populate: {
                            path: 'clientId',
                            select: 'firstName lastName',
                        },
                    },
                },
            });

        res.status(200).json(availableFleets);
    } catch (error) {
        console.error(`Error fetching available fleets: ${error.message}`);
        res.status(500).json({ message: 'Server error while fetching available fleets', error: error.message });
    }
});

router.put('/:id', authMiddleware([1, 2, 3]), async (req, res) => {
    try {
        const { reparationId } = req.body;
        const updateData = { reparationId: reparationId || null };

        const updatedFleet = await Fleet.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        });

        if (!updatedFleet) {
            return res.status(404).json({ message: 'Fleet entry not found' });
        }

        res.status(200).json({ message: 'Fleet entry updated successfully', fleet: updatedFleet });
    } catch (error) {
        console.error(`Error updating fleet: ${error.message}`);
        res.status(500).json({ message: 'Server error while updating fleet', error: error.message });
    }
});

router.get('/clear-reparations', authMiddleware([1, 2, 3]), async (req, res) => {
    try {
        const result = await Fleet.updateMany({}, { reparationId: null });
        res.status(200).json({
            message: `All reparationId fields have been set to null.`,
            modifiedCount: result.modifiedCount,
        });
    } catch (error) {
        console.error(`Error clearing reparationIds: ${error.message}`);
        res.status(500).json({ message: 'Server error while clearing reparationIds', error: error.message });
    }
});

module.exports = router;