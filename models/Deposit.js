const mongoose = require('mongoose');

const depositSchema = new mongoose.Schema({
    vehicleId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Vehicle', 
        required: true 
    },
    typeReparationIds: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ReparationType', 
        required: true 
    }],
    appointmentDate: { 
        type: Date, 
        required: true 
    },
    description: { 
        type: String, 
        required: false 
    }
}, { timestamps: true });

module.exports = mongoose.model('Deposit', depositSchema);