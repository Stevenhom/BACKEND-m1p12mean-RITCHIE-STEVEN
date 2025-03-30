const mongoose = require('mongoose');

const reparationSchema = new mongoose.Schema(
    {
        depositId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Deposit',
            required: true
        },
        status: {
            type: String,
            enum: ['in_progress', 'completed', 'rejected', 'recovered'],
            default: 'in_progress'
        },
        startedAt: {
            type: Date
        },
        completedAt: {
            type: Date
        },
        recoveredAt: {
            type: Date
        },
        refusalReason: {
            type: String,
            required: function () {
                return this.status === 'rejected';
            }
        },
        additionalCosts: [
            {
                description: { type: String, required: true },
                cost: { type: Number, required: true }
            }
        ],
        mechanics: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ]
    },
    { timestamps: true }
);

module.exports = mongoose.model('Reparation', reparationSchema);