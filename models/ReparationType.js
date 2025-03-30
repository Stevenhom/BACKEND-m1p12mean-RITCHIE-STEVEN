const mongoose = require('mongoose');

const ReparationTypeSchema = new mongoose.Schema({
    label: { type: String, required: true, unique: true },
    cost: { type: Number, required: true }
});

module.exports = mongoose.model('ReparationType', ReparationTypeSchema);
