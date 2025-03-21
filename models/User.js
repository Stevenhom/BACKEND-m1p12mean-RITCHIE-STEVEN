const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    picture: { type: String, default: null },
    type: { type: Number, enum: [1, 2, 3], required: true },
    salary: { type: Number, default: 0 }
},  { timestamps: true });



module.exports = mongoose.model('User', userSchema);
