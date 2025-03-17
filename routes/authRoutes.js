const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');
const upload = multer();

// Inscription

router.post('/client', upload.single('picture'), async (req, res) => {
    try {
        const { firstName, lastName, phoneNumber, email, password } = req.body;
        const picture = req.file;

        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            firstName,
            lastName,
            phoneNumber,
            email,
            password: hashedPassword,
            picture: picture ? picture.buffer : null,
            type: 1
        });

        await user.save();
        res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
        console.error('Erreur :', error);
        res.status(500).json({ message: 'Server error' });
    }
});



router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Vérifier si l'utilisateur existe
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Email ou mot de passe invalide' });
        }

        // Vérifier si user.password est bien une string
        if (typeof user.password !== "string") {
            return res.status(500).json({ message: "Erreur serveur : problème avec le hash du mot de passe" });
        }

        // Vérifier le mot de passe
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Email ou mot de passe invalide' });
        }

        // Générer un token JWT
        const token = jwt.sign(
            { id: user._id, type: user.type },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION || '1h' }
        );

        res.json({ token, user: { id: user._id, email: user.email, type: user.type } });

    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Route protégée pour le manager
router.get('/admin', authMiddleware([3]), (req, res) => {
    res.json({ message: 'Bienvenue, manager !' });
});

// Route protégée pour le mecano
router.get('/mecanicien', authMiddleware([2]), (req, res) => {
    res.json({ message: 'Espace mécanicien !' });
});

// Route protégée pour le client
router.get('/client', authMiddleware([1]), (req, res) => {
    res.json({ message: 'Bienvenue à vous !' });
});

module.exports = router;