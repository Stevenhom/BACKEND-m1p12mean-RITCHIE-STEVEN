const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
    brand: { type: String, required: true }
},  { timestamps: true });

module.exports = mongoose.model('Brand', brandSchema);
