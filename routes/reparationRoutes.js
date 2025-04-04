const express = require('express');
const router = express.Router();
const Reparation = require('../models/Reparation');
const authMiddleware = require('../middlewares/authMiddleware');
const mongoose = require("mongoose");

router.post('/', authMiddleware([3]), async (req, res) => {
    try {
        const { status, refusalReason, mechanics } = req.body;

        if (status === 'rejected' && !refusalReason) {
            return res.status(400).json({ message: 'Refusal reason is required when rejecting a reparation' });
        }

        if (status === 'in_progress' && (!mechanics || mechanics.length === 0)) {
            return res.status(400).json({ message: 'At least one mechanic must be assigned when accepting a reparation' });
        }

        const newReparation = new Reparation(req.body);
        const savedReparation = await newReparation.save();
        res.status(201).json(savedReparation);
    } catch (error) {
        res.status(500).json({ message: 'Error creating reparation', error: error.message });
    }
});

router.get('/', authMiddleware([1, 2, 3]), async (req, res) => {
    try {
        const reparations = await Reparation.find()
            .populate({
                path: 'depositId',
                populate: [
                    {
                        path: 'vehicleId',
                        populate: {
                            path: 'clientId'
                        }
                    },
                    {
                        path: 'typeReparationIds'
                    }
                ]
            })
            .populate('mechanics');

        res.status(200).json(reparations);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reparations', error: error.message });
    }
});

router.put('/:id', authMiddleware([2, 3]), async (req, res) => {
    try {
        const updatedReparation = await Reparation.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedReparation) {
            return res.status(404).json({ message: 'Reparation not found' });
        }
        res.status(200).json(updatedReparation);
    } catch (error) {
        res.status(500).json({ message: 'Error updating reparation', error: error.message });
    }
});

router.delete('/:id', authMiddleware([3]), async (req, res) => {
    try {
        const deletedReparation = await Reparation.findByIdAndDelete(req.params.id);
        if (!deletedReparation) {
            return res.status(404).json({ message: 'Reparation not found' });
        }
        res.status(200).json({ message: 'Reparation deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting reparation', error: error.message });
    }
});

router.post('/:id/start', authMiddleware([3]), async (req, res) => {
    try {
        const reparation = await Reparation.findById(req.params.id);
        if (!reparation) {
            return res.status(404).json({ message: 'Reparation not found' });
        }
        if (reparation.status !== 'in_progress') {
            return res.status(400).json({ message: 'Reparation cannot be started unless it is accepted' });
        }
        reparation.startedAt = Date.now();
        await reparation.save();
        res.status(200).json({ message: 'Reparation started', reparation });
    } catch (error) {
        res.status(500).json({ message: 'Error starting reparation', error: error.message });
    }
});

router.post('/:id/complete', authMiddleware([3]), async (req, res) => {
    try {
        const reparation = await Reparation.findById(req.params.id);
        if (!reparation) {
            return res.status(404).json({ message: 'Reparation not found' });
        }
        if (reparation.status !== 'in_progress') {
            return res.status(400).json({ message: 'Reparation cannot be completed unless it is in progress' });
        }
        reparation.status = 'completed';
        reparation.completedAt = Date.now();
        await reparation.save();
        res.status(200).json({ message: 'Reparation completed', reparation });
    } catch (error) {
        res.status(500).json({ message: 'Error completing reparation', error: error.message });
    }
});

router.post('/:id/reject', authMiddleware([3]), async (req, res) => {
    try {
        const reparation = await Reparation.findById(req.params.id);
        if (!reparation) {
            return res.status(404).json({ message: 'Reparation not found' });
        }
        if (!req.body.refusalReason) {
            return res.status(400).json({ message: 'Refusal reason is required when rejecting a reparation' });
        }
        reparation.status = 'rejected';
        reparation.refusalReason = req.body.refusalReason;
        await reparation.save();
        res.status(200).json({ message: 'Reparation rejected', reparation });
    } catch (error) {
        res.status(500).json({ message: 'Error rejecting reparation', error: error.message });
    }
});

router.post('/:id/recover', authMiddleware([3]), async (req, res) => {
    try {
        const reparation = await Reparation.findById(req.params.id);
        if (!reparation) {
            return res.status(404).json({ message: 'Reparation not found' });
        }
        if (reparation.status !== 'completed') {
            return res.status(400).json({ message: 'Reparation cannot be marked as recovered unless it is completed' });
        }
        reparation.status = 'recovered';
        reparation.recoveredAt = Date.now();
        await reparation.save();
        res.status(200).json({ message: 'Reparation marked as recovered', reparation });
    } catch (error) {
        res.status(500).json({ message: 'Error recovering reparation', error: error.message });
    }
});

router.post('/:id/assign-mechanic', authMiddleware([3]), async (req, res) => {
    try {
        const { mechanicId } = req.body;
        const reparation = await Reparation.findById(req.params.id);
        if (!reparation) {
            return res.status(404).json({ message: 'Reparation not found' });
        }
        if (!reparation.mechanics.includes(mechanicId)) {
            reparation.mechanics.push(mechanicId);
            await reparation.save();
            res.status(200).json({ message: 'Mechanic assigned successfully', reparation });
        } else {
            res.status(400).json({ message: 'Mechanic is already assigned to this reparation' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error assigning mechanic', error: error.message });
    }
});

router.get('/rejected/:clientId', authMiddleware([1, 2, 3]), async (req, res) => {
    try {
        const { clientId } = req.params;

        const rejectedReparations = await Reparation.find({
            status: 'rejected'
        })
        .populate({
            path: 'depositId',
            populate: [
                {
                    path: 'vehicleId',
                    populate: { path: 'clientId' }
                },
                {
                    path: 'typeReparationIds'
                }
            ]
        })
        .populate('mechanics');

        const filteredReparations = rejectedReparations.filter(reparation => {
            return reparation.depositId && 
                   reparation.depositId.vehicleId && 
                   reparation.depositId.vehicleId.clientId && 
                   reparation.depositId.vehicleId.clientId._id.toString() === clientId;
        });

        res.status(200).json(filteredReparations);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error fetching rejected reparations', error: error.message });
    }
});

router.get('/mechanics/:mechanicId', authMiddleware([1, 2, 3]), async (req, res) => {
    try {
        const { mechanicId } = req.params;

        const reparations = await Reparation.find({
            mechanics: mechanicId,
            status: { $in: ['in_progress', 'completed'] }
        })
        .populate({
            path: 'depositId',
            populate: [
                {
                    path: 'vehicleId',
                    populate: { path: 'clientId' }
                },
                {
                    path: 'typeReparationIds' 
                }
            ]
        })
        .populate('mechanics');

        res.status(200).json(reparations);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error fetching reparations for mechanic', error: error.message });
    }
});

router.get('/:id', authMiddleware([1, 2, 3]), async (req, res) => {
    try {
        const { id } = req.params;

        const reparation = await Reparation.findById(id)
            .populate({
                path: 'depositId',
                populate: [
                    {
                        path: 'vehicleId',
                        populate: [
                            { path: 'clientId' },
                            { path: 'brandId' }  
                        ]

                    },
                    {
                        path: 'typeReparationIds'
                    }
                ]
            })
            .populate('mechanics');

        if (!reparation) {
            return res.status(404).json({ message: 'Reparation not found' });
        }

        res.status(200).json(reparation);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error fetching reparation by ID', error: error.message });
    }
});

router.get('/client/:clientId', authMiddleware([1, 2, 3]), async (req, res) => {
    try {
        const { clientId } = req.params;

        // Récupérer uniquement les réparations "in_progress" ou "completed"
        const clientReparations = await Reparation.find({
            status: { $in: ['in_progress', 'completed'] }, // Filtrer sur le statut
        })
        .populate({
            path: 'depositId',
            populate: [
                { path: 'vehicleId', populate: { path: 'clientId' } }
            ]
        })
        .populate('mechanics');

        // Filtrer pour ne garder que les réparations du client concerné
        const reparationsForClient = clientReparations.filter(reparation => 
            reparation.depositId.vehicleId.clientId._id.toString() === clientId
        );

        res.status(200).json(reparationsForClient);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error fetching reparations for client', error: error.message });
    }
});


router.get('/status/:status', authMiddleware([1, 2, 3]), async (req, res) => {
    try {
        const { status } = req.params;
        const validStatuses = ['pending', 'in_progress', 'completed', 'rejected', 'recovered'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status provided' });
        }

        const reparations = await Reparation.find({ status })
            .populate({
                path: 'depositId',
                populate: [
                    {
                        path: 'vehicleId',
                        populate: { path: 'clientId' }
                    },
                    {
                        path: 'typeReparationIds'
                    }
                ]
            })
            .populate('mechanics');

        res.status(200).json(reparations);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error fetching reparations by status', error: error.message });
    }
});

router.get('/status/:status/client/:clientId', authMiddleware([1, 2, 3]), async (req, res) => {
    try {
        const { status, clientId } = req.params;
        const validStatuses = ['pending', 'in_progress', 'completed', 'rejected', 'recovered'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status provided' });
        }

        if (!mongoose.Types.ObjectId.isValid(clientId)) {
            return res.status(400).json({ message: 'Invalid client ID' });
        }

        const reparations = await Reparation.find({ status })
            .populate({
                path: 'depositId',
                populate: [
                    {
                        path: 'vehicleId',
                        populate: { path: 'clientId' }
                    },
                    {
                        path: 'typeReparationIds'
                    }
                ]
            })
            .populate('mechanics');

        const filteredReparations = reparations.filter(
            repair => repair.depositId && 
                      repair.depositId.vehicleId && 
                      repair.depositId.vehicleId.clientId && 
                      repair.depositId.vehicleId.clientId._id.toString() === clientId
        );
        
        res.status(200).json(filteredReparations);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error fetching reparations by status and client', error: error.message });
    }
});
module.exports = router;