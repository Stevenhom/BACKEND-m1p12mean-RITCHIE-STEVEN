const mongoose = require('mongoose');

const fleetSchema = new mongoose.Schema(
    {
        place: { type: Number, required: true },
        reparationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reparation'}
    },
    { timestamps: true }
);

module.exports = mongoose.model('Fleet', fleetSchema);