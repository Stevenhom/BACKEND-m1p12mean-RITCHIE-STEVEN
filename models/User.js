const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    type: { type: Number, enum: [1,2,3], required: true }
}, { timestamps: true });



module.exports = mongoose.model('User', userSchema);
