const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    registrationNumber: { type: String, required: true },
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
    model: { type: String, required: true },
    color: { type: String, required: true },
    energy: { type: String, enum: ['Gas', 'Diesel', 'Electric'], required: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
