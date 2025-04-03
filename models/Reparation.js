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
                _id: false,
                description: { type: String, required: true },
                cost: { type: Number, required: true },
                date: { type: Date, required: true } 
            }
        ],
        mechanics: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        invoiceNumber: {
            type: String,
            unique: true
        }

    },
    { timestamps: true }
);

reparationSchema.pre('save', async function (next) {
    try {
        if (this.invoiceNumber) return next();

        const now = new Date();

        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');

        const random = Math.floor(Math.random() * 10000);
        this.invoiceNumber = `FAC-${year}${month}${day}-${random}`;

        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model('Reparation', reparationSchema);