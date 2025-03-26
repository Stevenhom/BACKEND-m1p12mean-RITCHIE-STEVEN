const mongoose = require('mongoose');

const fleetSchema = new mongoose.Schema({
    place: { type: Number, required: true },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Fleet', fleetSchema);